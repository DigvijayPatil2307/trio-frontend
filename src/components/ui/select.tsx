import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "../../lib/utils"

interface SelectContextType {
  value?: string
  onValueChange?: (value: string) => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  registerItem: (value: string, label: React.ReactNode) => void
  items: Record<string, React.ReactNode>
}

const SelectContext = React.createContext<SelectContextType>({
  isOpen: false,
  setIsOpen: () => {},
  registerItem: () => {},
  items: {},
})

export interface SelectProps {
  children: React.ReactNode
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

export function Select({ children, defaultValue, value: controlledValue, onValueChange }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  const [items, setItems] = React.useState<Record<string, React.ReactNode>>({})

  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue)
      }
      if (onValueChange) {
        onValueChange(newValue)
      }
      setIsOpen(false)
    },
    [isControlled, onValueChange]
  )

  const registerItem = React.useCallback((val: string, label: React.ReactNode) => {
    setItems((prev) => {
      if (prev[val] === label) return prev
      return { ...prev, [val]: label }
    })
  }, [])

  // Close when clicking outside
  const selectRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  return (
    <SelectContext.Provider
      value={{
        value,
        onValueChange: handleValueChange,
        isOpen,
        setIsOpen,
        registerItem,
        items,
      }}
    >
      <div ref={selectRef} className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, setIsOpen, value, items } = React.useContext(SelectContext)

    return (
      <button
        type="button"
        ref={ref}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all select-none text-left cursor-pointer",
          className
        )}
        {...props}
      >
        <span className="truncate">{value && items[value] ? items[value] : children}</span>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", isOpen && "transform rotate-180")} />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

export interface SelectValueProps {
  placeholder?: string
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const { value, items } = React.useContext(SelectContext)
  return <>{value && items[value] ? items[value] : placeholder}</>
}
export interface SelectContentProps extends React.ComponentPropsWithoutRef<"div"> {
  children?: React.ReactNode
  className?: string
}

export function SelectContent({ className, children, ...props }: SelectContentProps) {
  const { isOpen } = React.useContext(SelectContext)

  if (!isOpen) return null

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 text-slate-800 shadow-lg ring-1 ring-black/5 focus:outline-none animate-in fade-in-50 slide-in-from-top-1 duration-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface SelectItemProps extends React.ComponentPropsWithoutRef<"div"> {
  value: string
  children: React.ReactNode
  className?: string
}

export function SelectItem({ className, children, value, ...props }: SelectItemProps) {
  const { value: selectedValue, onValueChange, registerItem } = React.useContext(SelectContext)

  React.useEffect(() => {
    registerItem(value, children)
  }, [value, children, registerItem])

  const isSelected = selectedValue === value

  return (
    <div
      onClick={() => onValueChange?.(value)}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50 outline-none transition-colors",
        isSelected && "bg-slate-50 text-indigo-600 font-medium hover:text-indigo-600",
        className
      )}
      {...props}
    >
      {isSelected && (
        <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center text-indigo-600">
          <Check className="h-4 w-4" />
        </span>
      )}
      <span className="truncate">{children}</span>
    </div>
  )
}
