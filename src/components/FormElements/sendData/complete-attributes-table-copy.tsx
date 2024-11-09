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

interface AttributePair {
  key: string;
  value: string;
}

interface JsonData {
  [key: string]: any;
}

// Define props type for the component
interface EditableAttributesTableProps {
  data: JsonData;
}

const EditableAttributesTable: React.FC<EditableAttributesTableProps> = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return <p>No data available</p>;
  }

  console.log(data.record)

  

  const initialData = {
    "attributes": {
      "primary": data.record.attributes.primary,
      "secondary": data.record.attributes.secondary
    }
  };

  // Convert object to array of key-value pairs for easier manipulation
  const [primaryAttributes, setPrimaryAttributes] = useState<JsonData[]>(
    Object.entries(initialData.attributes.primary).map(([key, value]) => ({ key, value }))
  );
  const [secondaryAttributes, setSecondaryAttributes] = useState<JsonData[]>(
    Object.entries(initialData.attributes.secondary).map(([key, value]) => ({ key, value }))
  );
  const [isSaving, setIsSaving] = useState(false);

  const handlePrimaryChange = (index: number, field: 'key' | 'value', newValue: string) => {
    setPrimaryAttributes(prev => {
      const newAttributes = [...prev];
      newAttributes[index] = {
        ...newAttributes[index],
        [field]: newValue
      };
      return newAttributes;
    });
  };

  const handleSecondaryChange = (index: number, field: 'key' | 'value', newValue: string) => {
    setSecondaryAttributes(prev => {
      const newAttributes = [...prev];
      newAttributes[index] = {
        ...newAttributes[index],
        [field]: newValue
      };
      return newAttributes;
    });
  };

  const handleAddPrimary = () => {
    setPrimaryAttributes(prev => [...prev, { key: '', value: '' }]);
  };

  const handleAddSecondary = () => {
    setSecondaryAttributes(prev => [...prev, { key: '', value: '' }]);
  };

  const handleRemovePrimary = (index: number) => {
    setPrimaryAttributes(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveSecondary = (index: number) => {
    setSecondaryAttributes(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert arrays back to objects for API
      const primaryObj = Object.fromEntries(primaryAttributes.map(attr => [attr.key, attr.value]));
      const secondaryObj = Object.fromEntries(secondaryAttributes.map(attr => [attr.key, attr.value]));

      const response = await fetch('https://dc7c-91-194-240-2.ngrok-free.app/update-record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          building : "Building 1",
          equipment_name : "Support Beam B-12",
          high_priority : false,
          maintenance_required : false,
          comments : "Annual structural inspection completed, no issues found",
          record: {
            primary: primaryObj,
            secondary: secondaryObj
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
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Primary Attributes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {primaryAttributes.map((attr, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-5">
                  <Input
                    value={attr.key}
                    onChange={(e) => handlePrimaryChange(index, 'key', e.target.value)}
                    placeholder="Key"
                  />
                </div>
                <div className="col-span-5">
                  <Input
                    value={attr.value}
                    onChange={(e) => handlePrimaryChange(index, 'value', e.target.value)}
                    placeholder="Value"
                  />
                </div>
                <div className="col-span-2">
                  <Button 
                    onClick={() => handleRemovePrimary(index)}
                    className="bg-red-600 hover:bg-red-700 w-full"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardHeader className="flex flex-row justify-between items-center">
          <Button onClick={handleAddPrimary} className="bg-green-600 hover:bg-green-700">
              Add New
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Secondary Attributes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {secondaryAttributes.map((attr, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-5">
                  <Input
                    value={attr.key}
                    onChange={(e) => handleSecondaryChange(index, 'key', e.target.value)}
                    placeholder="Key"
                  />
                </div>
                <div className="col-span-5">
                  <Input
                    value={attr.value}
                    onChange={(e) => handleSecondaryChange(index, 'value', e.target.value)}
                    placeholder="Value"
                  />
                </div>
                <div className="col-span-2">
                  <Button 
                    onClick={() => handleRemoveSecondary(index)}
                    className="bg-red-600 hover:bg-red-700 w-full"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardHeader className="flex flex-row justify-between items-center">
          <Button onClick={handleAddSecondary} className="bg-green-600 hover:bg-green-700">
              Add New
          </Button>
        </CardHeader>
      </Card>


      <div className="flex flex-col gap-9">
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
            <div className="flex flex-col gap-6 p-6.5">
              <div className="flex justify-center">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
      </div>

      
    </div>
  );
};

export default EditableAttributesTable;
