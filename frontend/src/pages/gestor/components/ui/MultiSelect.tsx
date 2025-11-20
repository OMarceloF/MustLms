import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "./popover"

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "./command"

import { Checkbox } from "./checkbox"
import { ChevronsUpDown } from "lucide-react"
import { cn } from "../../../lib/utils"

interface MultiSelectProps {
    options: { id: number; label: string }[];
    value: number[];
    onChange: (value: number[]) => void;
    placeholder?: string;
}

export function MultiSelect({ options, value, onChange, placeholder }: MultiSelectProps) {
    const toggle = (id: number) => {
        if (value.includes(id)) {
            onChange(value.filter(v => v !== id));
        } else {
            onChange([...value, id]);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        "w-full flex justify-between items-center rounded-lg border bg-background px-4 py-2 text-sm",
                        "hover:bg-muted/50 transition"
                    )}
                >
                    <span className="text-left">
                        {value.length === 0 ? (
                            <span className="text-muted-foreground">{placeholder}</span>
                        ) : (
                            `${value.length} selecionada(s)`
                        )}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </button>
            </PopoverTrigger>

            <PopoverContent className="w-[300px] p-0 rounded-xl shadow-xl border">
                <Command>
                    <CommandInput placeholder="Buscar disciplina..." />
                    <CommandEmpty>Nenhuma disciplina encontrada.</CommandEmpty>

                    <CommandGroup>
                        {options.map((op) => (
                            <CommandItem
                                key={op.id}
                                onSelect={() => toggle(op.id)}
                                className="cursor-pointer"
                            >
                                <Checkbox
                                    checked={value.includes(op.id)}
                                    className="mr-2"
                                />
                                {op.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
