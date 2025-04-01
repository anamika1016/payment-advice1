import React, { useState, useRef } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const SearchResults = ({
  id,
  label,
  items,
  value = "",
  onInputChange,
  onItemSelect,
  disabled = false,
  placeholder = "Search recipients...",
}) => {
  const [open, setOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const inputRef = useRef(null);

  const handleSelect = (recipient) => {
    if (disabled) return;

    setSelectedRecipient(recipient);
    
    // Update the input field with the selected recipient's name
    onInputChange(id, recipient.name);
    
    // Send the entire recipient object to the parent component
    // This allows the parent to access all recipient data
    onItemSelect("recipient_data", recipient);
    
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onInputChange(id, inputValue);
    setOpen(inputValue.length > 0);
    
    // Clear the selected recipient when input changes
    if (selectedRecipient && selectedRecipient.name !== inputValue) {
      setSelectedRecipient(null);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-1.5">
        {label && (
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
          </Label>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Input
                id={id}
                ref={inputRef}
                value={value}
                onChange={handleInputChange}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full"
              />
              {selectedRecipient && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[300px]" align="start">
            {value.length > 0 && (
              <Command>
                <CommandList>
                  <CommandEmpty>No recipients found.</CommandEmpty>
                  <CommandGroup>
                    {items.map((recipient) => (
                      <CommandItem
                        key={recipient.id || recipient._id || recipient.accountNumber}
                        onSelect={() => handleSelect(recipient)}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2"
                      >
                        <span className={cn("flex-1 truncate")}>
                          {recipient.name}
                        </span>
                        {selectedRecipient?.id === recipient.id && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
};

export default SearchResults;