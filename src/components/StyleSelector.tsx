"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface StyleSelectorProps {
  styles: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function StyleSelector({
  styles,
  value,
  onChange,
  disabled,
}: StyleSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="style">Art Style</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="style">
          <SelectValue placeholder="Select a style" />
        </SelectTrigger>
        <SelectContent>
          {styles.map((style) => (
            <SelectItem key={style} value={style}>
              {style.charAt(0).toUpperCase() + style.slice(1).replace("-", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
