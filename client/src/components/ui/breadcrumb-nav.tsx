import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/icon-registry";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  className?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function BreadcrumbNav({ 
  items, 
  className, 
  showBackButton = true, 
  onBack 
}: BreadcrumbNavProps) {
  const [, setLocation] = useLocation();

  const handleItemClick = (item: BreadcrumbItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      setLocation(item.href);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <nav className={cn("flex items-center space-x-2 mb-6", className)}>
      {showBackButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="hover:-translate-y-0.5"
          data-testid="button-back-navigation"
        >
          <AppIcon name="chevronLeft" className="w-4 h-4 mr-1" />
          Back
        </Button>
      )}
      
      <div className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            {index > 0 && (
              <AppIcon name="chevronRight" className="w-3 h-3 text-muted-foreground" />
            )}
            
            {item.href || item.onClick ? (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => handleItemClick(item)}
                className={cn(
                  "h-auto p-1 font-medium hover:-translate-y-0.5",
                  item.isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                data-testid={`breadcrumb-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {index === 0 && <AppIcon name="home" className="w-3 h-3 mr-1" />}
                {item.label}
              </Button>
            ) : (
              <span 
                className={cn(
                  "font-medium",
                  item.isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
              >
                {index === 0 && <AppIcon name="home" className="w-3 h-3 mr-1 inline" />}
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}