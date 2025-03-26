import React, { useState, useRef, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const SearchResults = ({
  id,
  label,
  items,
  value = "",
  onInputChange,
  onItemSelect,
  disabled = false,
  notRequired = false,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);

  // Reset search term when items change or value is cleared
  useEffect(() => {
    if (!value) setSearchTerm("");
  }, [value, items]);

  // Click outside handling
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("scroll", handleClickOutside, true);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleClickOutside, true);
    };
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { id, value } = e.target;
    onInputChange(id, value);
    setSearchTerm(value);
    setIsOpen(true);
  };

  // Handle item selection
  const onOptionClicked = (recipient) => {
    if (disabled) return;

    // Set search term to the name
    setSearchTerm(recipient.name);

    // Prepare fields to be dispatched
    const fieldsToDispatch = {
      recipient_name: recipient.name,
      recipient_email: recipient.email,
      recipient_address: `${recipient.bankAddress}, ${recipient.district}, ${recipient.state}`,
      account_number: recipient.accountNumber,
      ifsc_code: recipient.ifscCode,
      // You can add more fields as needed
    };

    // Dispatch each field
    Object.entries(fieldsToDispatch).forEach(([key, value]) => {
      onItemSelect(key, value);
    });

    // Close dropdown
    setIsOpen(false);
  };

  // Filter items based on search term
  const filteredItems = items.filter(recipient => 
    recipient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`flex flex-col space-y-[4px] ${
        disabled ? "item-disabled" : ""
      }`}
      ref={selectRef}
    >
      <Label htmlFor={id} className="required-input">
        {label}
      </Label>
      <div className="relative inline-flex w-full bg-inputBackground rounded-lg h-[33px]">
        <Input
          id={id}
          type="text"
          onChange={handleChange}
          placeholder={placeholder}
          value={searchTerm || ""}
          disabled={disabled}
        />
        <div
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 flex justify-center items-center`}
        >
          <FaSearch
            style={{ color: isOpen ? "var(--color-primary)" : "#000000" }}
          />
        </div>
      </div>
      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="fixed z-50 left-0 mt-1 w-full origin-top-right rounded-md bg-inputBackground max-h-60 overflow-y-auto custom-scrollbar shadow-lg"
          style={{
            top: selectRef.current
              ? selectRef.current.getBoundingClientRect().bottom
              : "auto",
            left: selectRef.current
              ? selectRef.current.getBoundingClientRect().left
              : "auto",
            width: selectRef.current
              ? selectRef.current.getBoundingClientRect().width
              : "auto",
          }}
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((recipient) => (
              <button
                type="button"
                onClick={() => onOptionClicked(recipient)}
                key={recipient._id}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary hover:text-white focus:outline-none capitalize"
              >
                {recipient.name}
                <span className="text-xs text-gray-500 block">
                  {recipient.email}
                </span>
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              No recipients found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;