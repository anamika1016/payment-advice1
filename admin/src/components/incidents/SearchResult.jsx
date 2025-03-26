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

    // Prepare fields to be dispatched
    const fieldsToDispatch = {
      recipient_name: recipient.name,
      recipient_email: recipient.email,
      recipient_address: `${recipient.bankAddress}, ${recipient.district}, ${recipient.state}`,
      account_number: recipient.accountNumber,
      ifsc_code: recipient.ifscCode,
    };

    // Dispatch each field
    Object.entries(fieldsToDispatch).forEach(([key, value]) => {
      onItemSelect(key, value);
    });

    setOpen(false);
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onInputChange(id, inputValue);
    setOpen(inputValue.length > 0);
    setSelectedRecipient(null);
  };

  return (
    <>
      <Label htmlFor={id} className="required-input">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input
            ref={inputRef}
            id={id}
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full"
          />
        </PopoverTrigger>
        {value.length > 0 && (
          <PopoverContent
            className="p-0"
            style={{
              marginTop: "5px",
              width: inputRef.current
                ? `${inputRef.current.offsetWidth}px`
                : "auto",
            }}
          >
            <Command>
              <CommandList>
                {items.length > 0 ? (
                  <CommandGroup>
                    {items.map((recipient) => (
                      <CommandItem
                        key={recipient._id}
                        value={recipient.name}
                        onSelect={() => handleSelect(recipient)}
                      >
                        {recipient.name}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            selectedRecipient?._id === recipient._id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : (
                  <CommandEmpty>No recipients found.</CommandEmpty>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
    </>
  );
};

export default SearchResults;
