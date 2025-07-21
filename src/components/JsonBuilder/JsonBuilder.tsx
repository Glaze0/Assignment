import React, { useState } from 'react'
import { Input } from '../ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';


//Declarying the types for the fields.
type FieldType = "nested" | "string" | "number" | "boolean" | "float" | "objectId";
interface Field{
    id: string;
    key: string;
    type: FieldType;
    children?: Field[];
}

// Function to generate a random ID for each field.
const generateId = () => Math.random().toString(36).substr(2, 9)


// Function to export the JSON Schema.
function exportJson(fields: Field[]): Record<string, any> {
    const output: Record<string, any> = {};
    fields.forEach((field) => {
        if (!field.key) return;
        if (field.type === "nested" && field.children){
            output[field.key] = exportJson(field.children);
    }
        else if (field.type === "string") {
            output[field.key] = "STRING";
        }
        else if (field.type === "number") {
            output[field.key] = "NUMBER";
        }
        else if (field.type === "boolean") {
            output[field.key] = "BOOLEAN";
        }
        else if (field.type === "float") {
            output[field.key] = "FLOAT";
        }
        else if (field.type === "objectId") {
            output[field.key] = "OBJECT ID";
        }
    })
    return output;
}

// Interface for the JSON Schema Editor component props.
interface SchemaEditorProps {
    fields: Field[];
    onFieldsChange: (fields: Field[]) => void;
    level?: number;
}


// JSON Schema Editor component to manage the fields and their field types.
const SchemaEditor: React.FC<SchemaEditorProps> = ({
    fields,
    onFieldsChange,
    level = 0,
}) => {
    // Function to handle upda Nested Field.
    const handleFieldUpdate = (idx: number, updated: Field) => {
        const newFields = [...fields];
        newFields[idx] = updated;
        onFieldsChange(newFields);
    };
    // Function to add a new field.
    const handleAddField = () => {
        onFieldsChange([ ...fields,
            { id: generateId(), key: "", type: "string" },
        ])
    }
    // Function to delete a field.
    const handleDeleteField = (idx: number) => {
        const newFields = [...fields];
        newFields.splice(idx, 1);
        onFieldsChange(newFields);
    }

    //Rendering the JSON Schema Editor.
    return (
        <div className='m- '>
            {fields.map((field, idx) => (
            <div key={field.id} className='mb-4 '>
                <Input placeholder='Field Name' type='text' value={field.key} className='w-80 bg-white'
                    onChange={(e) => handleFieldUpdate(idx, { ...field, key: e.target.value })} />
                    <div className="flex ">
                        
                        <Select 
                        value={field.type}
                        onValueChange={(value) => {
                          const newType = value as FieldType;
                          let updated: Field = { ...field, type: newType };
                          if (newType === "nested" && !field.children) {
                           updated.children = [];
                          } else if (newType !== "nested") {
                            delete updated.children;
                          }
                      handleFieldUpdate(idx, updated);
                        }}
                    >
                        <SelectTrigger className='w-30 bg-white'>
                            <SelectValue  placeholder="Field Type"/>
                        </SelectTrigger>
                        <SelectContent><SelectGroup>
                            <SelectItem value='nested'>Nested</SelectItem>
                            <SelectItem value='string'>String</SelectItem>
                            <SelectItem value='number'>Number</SelectItem>
                            <SelectItem value='boolean'>Boolean</SelectItem>
                            <SelectItem value='float'>Float</SelectItem>
                            <SelectItem value='objectId'>Object Id</SelectItem>
                        </SelectGroup>
                        </SelectContent>  
                    </Select>
                
                    <Button variant={"ghost"} onClick={() => handleDeleteField(idx)}>X</Button>
                    {field.type === "nested" && (
                        <div className="border-l-2 border-solid border-[#ccc] mt-8 pl-12">
                            <SchemaEditor fields={field.children || []}
                                onFieldsChange={(children) => handleFieldUpdate(idx, { ...field, children })}
                                level={level + 1}
                            />
                        </div>
                    )}
                    </div>
            </div>
            ))}
            <Button variant={"default"} onClick={handleAddField} className='w-80'>
                Add Field
            </Button>
        </div>
    )
}


// Main component for the JSON Schema Builder.
const JsonBuilder: React.FC = () => {
    const [fields, setFields] = useState<Field[]>([]);


  return (
      <div className='p-6 h-screen h-max w-auto flex flex-col bg-gradient-to-br from-gray-100 to-gray-300 rounded-lg shadow-lg'>
          <div className="flex flex-row">
              <div className="w-3/5 p-2">
              <h1 className='font-bold flex justify-center'>JSON Schema Builder</h1>
              <SchemaEditor fields={fields} onFieldsChange={setFields} />                                                       
          </div>
          <div className="h-150 w-3/7 border-3 border-gray-800 p-2">
              <h2 className='font-bold flex justify-center'>Generated Json Schema</h2>
              <pre className=" border-2 bg-gray-50">{JSON.stringify(exportJson(fields), null, 2) }</pre>  
          </div>
          </div>
          
        <Button className='w-25 ' variant={"outline"}> Submit </Button>
      </div>
      
  )
}

export default JsonBuilder
