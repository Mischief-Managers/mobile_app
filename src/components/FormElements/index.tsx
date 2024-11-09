"use client";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import CheckboxFive from "@/components/FormElements/Checkboxes/CheckboxFive";
import CheckboxFour from "@/components/FormElements/Checkboxes/CheckboxFour";
import CheckboxOne from "@/components/FormElements/Checkboxes/CheckboxOne";
import CheckboxThree from "@/components/FormElements/Checkboxes/CheckboxThree";
import CheckboxTwo from "@/components/FormElements/Checkboxes/CheckboxTwo";
import SwitcherFour from "@/components/FormElements/Switchers/SwitcherFour";
import SwitcherOne from "@/components/FormElements/Switchers/SwitcherOne";
import SwitcherMaintain from "@/components/FormElements/Switchers/SwitcherMaintain";
import SwitcherThree from "@/components/FormElements/Switchers/SwitcherThree";
import SwitcherTwo from "@/components/FormElements/Switchers/SwitcherTwo";
import DatePickerTwo from "@/components/FormElements/DatePicker/DatePickerTwo";
import DatePickerOne from "@/components/FormElements/DatePicker/DatePickerOne";
import MultiSelect from "@/components/FormElements/MultiSelect";
import SelectGroupTwo from "@/components/FormElements/SelectGroup/SelectGroupTwo";
import VoiceInputField from "@/components/FormElements/voiceInput/voice-input-field-copy";
import MediaUploadField from "@/components/FormElements/imageCapture/media-upload-with-api";
import { SetStateAction, useState } from 'react';
import EditableAttributesTable from "@/components/FormElements/sendData/complete-attributes-table-copy";

const FormElements = () => {
  const [equipmentName, setEquipmentName] = useState('');
  const [highPriorityEnabled, setHighPriorityEnabled] = useState(false); // Added state for SwitcherOne
  const [maintainenceEnabled, setMaintainenceEnabled] = useState(false); // Added state for SwitcherOne
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);

  const handleInputChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    console.log(event.target.value)
    setEquipmentName(event.target.value);
  };

  const handleBuildingSelect = (values: string[]) => {
    console.log('Selected Buildings:', values);
    setSelectedBuildings(values);
    console.log('Selected Buildings:', values);
  };

  // You can now access the highPriorityEnabled value here
  console.log('Eqipment Name:', equipmentName);
  console.log('High Priority Status:', highPriorityEnabled);
  console.log('Maintainence Status:', maintainenceEnabled);
  console.log('Date:', selectedDate);


  return (
    <>
      <Breadcrumb pageName="FormElements" />

      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        <div className="flex flex-col gap-9">
          {/* <!-- Input Fields --> */}
          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-dark-3">
              <h3 className="font-medium text-dark dark:text-white">
                Input Fields
              </h3>
            </div>
            <div className="flex flex-col gap-5.5 p-6.5">
            <DatePickerOne 
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />

              <MultiSelect 
                id="multiSelect" 
                onSelectedChange={handleBuildingSelect}
              />

              <div>
                <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                  Equipment Name
                </label>
                <input
                  type="text"
                  placeholder="Equipment Name"
                  value={equipmentName}
                  onChange={handleInputChange}
                  className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-dark-3">
              <h3 className="font-medium text-dark dark:text-white">
                Equipment Status
              </h3>
            </div>
            <div className="flex flex-col gap-5.5 p-6.5">
              <SwitcherOne 
                enabled={highPriorityEnabled} 
                setEnabled={setHighPriorityEnabled} 
              />
              <SwitcherMaintain
              enabled={maintainenceEnabled} 
              setEnabled={setMaintainenceEnabled}
              />

              <div>
                <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                  Maintainence Comments
                </label>
                <textarea
                  rows={6}
                  placeholder="Default textarea"
                  className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                ></textarea>

                <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                  Maintainence Comments (VOICE)
                </label>

                <VoiceInputField />

                <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
                  Equipment Photos
                </label>

                <MediaUploadField />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-9">
            <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
              <div className="flex flex-col gap-6 p-6.5">
                {/* <EditableAttributesTable /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormElements;
