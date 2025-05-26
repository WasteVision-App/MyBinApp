
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { BinType, BinInspection, MissingBinReport } from '@/types';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import * as LucideIcons from 'lucide-react';

interface BinInspectionFormProps {
  bin: BinType;
  onSubmit: (inspection: BinInspection) => void;
  onCancel: () => void;
  onReportMissing: (binIds: string[], comment: string) => void;
  initialData?: BinInspection; // For editing regular inspection
  missingBinReport?: MissingBinReport; // For editing missing bin report
}

const BinInspectionForm: React.FC<BinInspectionFormProps> = ({
  bin,
  onSubmit,
  onCancel,
  onReportMissing,
  initialData,
  missingBinReport
}) => {
  const FULLNESS_VALUES = ["0%", "25%", "50%", "75%", "100%", "Overflow"];
  
  // Initialize form state with initialData if provided (for editing)
  const [fullness, setFullness] = useState<number | string>(
    initialData ? (initialData.fullness > 100 ? "Overflow" : initialData.fullness) : 50
  );
  const [contaminated, setContaminated] = useState(initialData ? initialData.contaminated : false);
  const [open, setOpen] = useState(false);
  const [selectedContaminationTypes, setSelectedContaminationTypes] = useState<string[]>([]);
  const [contaminationTypes, setContaminationTypes] = useState<{value: string, label: string}[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize missing bin state from missingBinReport prop if provided
  const [isMissing, setIsMissing] = useState(!!missingBinReport);
  const [missingComment, setMissingComment] = useState(missingBinReport?.comment || '');

  useEffect(() => {
    const fetchContaminationTypes = async () => {
      try {
        // First, fetch contamination types that are linked to this bin type
        const { data: linkedTypes, error: linkedError } = await supabase
          .from('contamination_bin_types')
          .select(`
            contamination_type_id,
            contamination_types (
              id,
              name,
              description
            )
          `)
          .eq('bin_type_id', bin.id);
        
        if (linkedError) {
          console.error('Error fetching linked contamination types:', linkedError);
          // If there's an error, fall back to all contamination types
          fallbackToAllTypes();
          return;
        }
        
        // If we have linked types, use them
        if (linkedTypes && linkedTypes.length > 0) {
          console.log('Found linked contamination types:', linkedTypes);
          const formattedTypes = linkedTypes
            .filter(link => link.contamination_types) // Ensure we have contamination_types data
            .map(link => ({
              value: link.contamination_types.id,
              label: link.contamination_types.name
            }));
          
          setContaminationTypes(formattedTypes);
          setLoading(false);
        } else {
          // If no linked types, fall back to all contamination types
          console.log('No linked contamination types found, fetching all types');
          fallbackToAllTypes();
        }
      } catch (error) {
        console.error('Error in contamination types fetch:', error);
        fallbackToAllTypes();
      }
    };

    const fallbackToAllTypes = async () => {
      try {
        // Fetch all contamination types as a fallback
        const { data, error } = await supabase
          .from('contamination_types')
          .select('id, name, description');
        
        if (error) {
          console.error('Error fetching all contamination types:', error);
          return;
        }
        
        console.log('Fetched all contamination types:', data);
        
        const formattedTypes = data.map(type => ({
          value: type.id,
          label: type.name
        }));
        
        setContaminationTypes(formattedTypes);
      } catch (error) {
        console.error('Error in fallback contamination types fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContaminationTypes();
  }, [bin.id]);

  // Load contamination types from initialData if provided
  useEffect(() => {
    if (initialData?.contaminationDetails && contaminated && contaminationTypes.length > 0) {
      const detailsArray = initialData.contaminationDetails.split(', ');
      
      // Find the contamination type IDs that match the labels from initialData
      const matchedTypeIds = contaminationTypes
        .filter(type => detailsArray.includes(type.label))
        .map(type => type.value);
      
      if (matchedTypeIds.length > 0) {
        setSelectedContaminationTypes(matchedTypeIds);
      }
    }
  }, [initialData, contaminationTypes, contaminated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isMissing) {
      // If bin is marked as missing, report it and return to bin selection
      if (!missingComment.trim()) {
        // Validate that a comment is provided
        alert("Please provide a comment about why the bin is missing");
        return;
      }
      
      // Use the full bin ID and name when reporting a missing bin
      const binKey = `${bin.id}-${bin.name}`;
      onReportMissing([binKey], missingComment);
      return;
    }
    
    // Convert Overflow to 125 for submission
    let submissionFullness: number;
    if (fullness === "Overflow") {
      submissionFullness = 125;
    } else if (typeof fullness === 'string') {
      // Remove % and convert to number
      submissionFullness = Number(fullness.replace('%', ''));
    } else {
      submissionFullness = fullness;
    }
    
    const inspection: BinInspection = {
      binTypeId: bin.id,
      binName: bin.name,
      binSize: bin.bin_size || 'Unknown',
      fullness: submissionFullness,
      contaminated,
      contaminationDetails: contaminated && selectedContaminationTypes.length > 0 
        ? selectedContaminationTypes.map(typeId => 
            contaminationTypes.find(type => type.value === typeId)?.label || typeId
          ).join(', ')
        : undefined,
      timestamp: new Date().toISOString()
    };
    
    onSubmit(inspection);
  };

  const toggleContaminationType = (value: string) => {
    setSelectedContaminationTypes(current => 
      current.includes(value)
        ? current.filter(type => type !== value)
        : [...current, value]
    );
  };

  const removeContaminationType = (value: string) => {
    setSelectedContaminationTypes(current => 
      current.filter(type => type !== value)
    );
  };

  const getFullnessLabel = (value: number | string) => {
    if (value === "Overflow") return "Overflow";
    
    if (typeof value === 'string' && value.includes('%')) {
      return value;
    }
    
    const numValue = typeof value === 'number' ? value : Number(value);
    
    switch(numValue) {
      case 0: return "Empty (0%)";
      case 25: return "Quarter Full (25%)";
      case 50: return "Half Full (50%)";
      case 75: return "Nearly Full (75%)";
      case 100: return "Completely Full (100%)";
      default: return `${numValue}%`;
    }
  };

  // For slider, convert "Overflow" to 125 for UI purposes
  const getSliderValue = () => {
    if (fullness === "Overflow") return 125;
    if (typeof fullness === 'string' && fullness.includes('%')) {
      return Number(fullness.replace('%', ''));
    }
    return typeof fullness === 'number' ? fullness : 0;
  };

  // Convert slider value to display value
  const handleSliderChange = (values: number[]) => {
    const value = values[0];
    if (value > 100) {
      setFullness("Overflow");
    } else {
      setFullness(value);
    }
  };

  // Function to render the appropriate icon based on the icon name
  const renderBinIcon = (iconName: string) => {
    // Convert to a standardized format (remove spaces, to lowercase)
    const normalizedIconName = iconName.replace(/\s+/g, '-').toLowerCase();
    
    // Use the name to get the component from Lucide
    const IconComponent = (LucideIcons as any)[normalizedIconName] || 
                         (LucideIcons as any)[normalizedIconName.charAt(0).toUpperCase() + normalizedIconName.slice(1)] ||
                         (LucideIcons as any)["Trash2"];
    
    return <IconComponent size={24} />;
  };

  return (
    <div className="mybin-card">
      <div className="flex items-center mb-4">
        <div 
          className="w-10 h-10 flex items-center justify-center rounded-full mr-3 text-white"
          style={{ backgroundColor: bin.color }}
        >
          {renderBinIcon(bin.icon)}
        </div>
        <div>
          <h2 className="mybin-subtitle">{bin.name} Inspection</h2>
          <p className="text-sm text-mybin-gray">{bin.bin_size || 'Size not specified'}</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="missing" className="mybin-label">
              Bin is Missing?
            </Label>
            <Switch
              id="missing"
              checked={isMissing}
              onCheckedChange={setIsMissing}
            />
          </div>
        </div>

        {isMissing && (
          <div className="mb-6">
            <Label htmlFor="missingComment" className="mybin-label">
              Why is the bin missing? <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="missingComment"
              value={missingComment}
              onChange={(e) => setMissingComment(e.target.value)}
              placeholder="Please provide details about why the bin is missing"
              className="mybin-input mt-2"
              required
            />
          </div>
        )}

        {!isMissing && (
          <>
            <div className="mb-6">
              <Label className="mybin-label">Bin Fullness: {getFullnessLabel(fullness)}</Label>
              <div className="mt-2 px-3">
                <Slider
                  value={[getSliderValue()]}
                  min={0}
                  max={125}
                  step={25}
                  onValueChange={handleSliderChange}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-mybin-gray mt-1 relative">
                  {FULLNESS_VALUES.map((value, index) => (
                    <span 
                      key={String(value)}
                      className="flex-1 text-center"
                      style={{
                        position: 'absolute',
                        left: `${(index * 100) / (FULLNESS_VALUES.length - 1)}%`,
                        transform: 'translateX(-50%)'
                      }}
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="contaminated" className="mybin-label">
                  Contamination Present?
                </Label>
                <Switch
                  id="contaminated"
                  checked={contaminated}
                  onCheckedChange={setContaminated}
                />
              </div>
            </div>
            
            {contaminated && (
              <div className="mb-6">
                <Label htmlFor="contaminationType" className="mybin-label mb-2 block">
                  What type of contamination?
                </Label>
                {loading ? (
                  <div className="text-sm text-mybin-gray">Loading contamination types...</div>
                ) : contaminationTypes.length === 0 ? (
                  <div className="text-sm text-mybin-gray">No contamination types available for this bin</div>
                ) : (
                  <>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between mybin-input"
                        >
                          {selectedContaminationTypes.length > 0
                            ? `${selectedContaminationTypes.length} type(s) selected`
                            : "Select contamination type(s)..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search contamination type..." className="h-10" />
                          <CommandEmpty>No contamination type found.</CommandEmpty>
                          <CommandList>
                            <CommandGroup>
                              {contaminationTypes.map((type) => (
                                <CommandItem
                                  key={type.value}
                                  value={type.value + type.label} // Include label in value for proper searching
                                  onSelect={() => toggleContaminationType(type.value)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedContaminationTypes.includes(type.value) ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {type.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {selectedContaminationTypes.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedContaminationTypes.map(typeId => {
                          const contaminationType = contaminationTypes.find(type => type.value === typeId);
                          return (
                            <div 
                              key={typeId}
                              className="bg-mybin-light text-mybin-primary px-2 py-1 rounded-md flex items-center text-sm"
                            >
                              {contaminationType?.label || typeId}
                              <button 
                                type="button" 
                                onClick={() => removeContaminationType(typeId)}
                                className="ml-1 text-mybin-gray hover:text-mybin-primary"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
        
        <div className="flex space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="mybin-btn-secondary flex-1"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="mybin-btn-primary flex-1"
          >
            {isMissing ? "Report as Missing" : "Save Inspection"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BinInspectionForm;
