import React, { useState, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';

// Input Component
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = '', type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      ref={ref}
      {...props}
    />
  );
});

// Button Component
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className = '', ...props }, ref) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gray-900 text-gray-50 hover:bg-gray-900/90 h-10 px-4 py-2 ${className}`}
      ref={ref}
      {...props}
    />
  );
});

// Card Components
interface CardProps {
  className?: string;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ className = '', children, ...props }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader: React.FC<CardProps> = ({ className = '', children, ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle: React.FC<CardProps> = ({ className = '', children, ...props }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

const CardContent: React.FC<CardProps> = ({ className = '', children, ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

// Main Component
const EditableAttributesTable = () => {
  // Initial data from your JSON
  const initialData = {
    "attributes": {
      "primary": {
        "CE": "0875",
        "GST-LÄMMÖNJAKOKESKUS": "",
        "ID-numero": "513-013485-1",
        "Kohde": "Elämänkatu 3D, Hki",
        "Käyttötarkoitus": "Kaukolämpökeskus",
        "PED-luokka": "II",
        "Tyyppi": "GST-4",
        "Valm.vuosi": "2018",
        "Valmistaja": "HögforsGST Oy, Leppävirta"
      },
      "secondary": {
        "ENSIÖ KÄYTTÖVESI": "10",
        "Koepainnistuspaine bar": "23",
        "LÄMMITYS 1": "100",
        "LÄMMITYS 2": "100",
        "LÄMMITYS 3": "100",
        "Lämmönjakokeskus": "",
        "Lämmönsiirrin": "",
        "Lämpöteho": "kW",
        "Lämpötila °C": "",
        "Maks. käyttöpaine bar": "16",
        "Maks. lämpötila °C": "130",
        "Min.lämpötila °C": "0",
        "Painehäviö/siirrin kPa": "",
        "Tilavuus L": "",
        "Tilavuusvirta": "l/s"
      }
    }
  };

  const [primaryAttributes, setPrimaryAttributes] = useState<Record<string, string>>(initialData.attributes.primary);
  const [secondaryAttributes, setSecondaryAttributes] = useState<Record<string, string>>(initialData.attributes.secondary);
  const [isSaving, setIsSaving] = useState(false);

  const handlePrimaryChange = (key: string, value: string) => {
    setPrimaryAttributes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSecondaryChange = (key: string, value: string) => {
    setSecondaryAttributes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/save-attributes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attributes: {
            primary: primaryAttributes,
            secondary: secondaryAttributes
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save attributes');
      }

      alert('Attributes saved successfully!');
    } catch (error) {
      console.error('Error saving attributes:', error);
      alert('Failed to save attributes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Primary Attributes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(primaryAttributes).map(([key, value]) => (
              <div key={key} className="col-span-2 grid grid-cols-2 gap-4 items-center">
                <div className="font-medium">{key}</div>
                <Input
                  value={value}
                  onChange={(e) => handlePrimaryChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Secondary Attributes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(secondaryAttributes).map(([key, value]) => (
              <div key={key} className="col-span-2 grid grid-cols-2 gap-4 items-center">
                <div className="font-medium">{key}</div>
                <Input
                  value={value}
                  onChange={(e) => handleSecondaryChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default EditableAttributesTable;
