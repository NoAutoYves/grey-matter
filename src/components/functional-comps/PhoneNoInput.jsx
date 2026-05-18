import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { useState } from 'react';
import MessageModal from '../modal-components/MessageModal';
import { apiRequest } from '../../utils/api';

function PhoneNoInput() {
  // value stores the phone number as user types (e.g., "+27721234567")
  const [value, setValue] = useState();
  
  // State for message modal
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");

  const showMessage = (msg) => {
    setMessageText(msg);
    setMessageModalOpen(true);
  };

  // This function runs when user clicks the Save button
  const handleSave = async () => {
    // Check that phone number has been entered
    if (!value) {
      showMessage('Please enter a phone number');
      return;
    }

    // Send the phone number to Flask backend
    const response = await apiRequest(`/api/updatePhoneNumber`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ phone: value }), // Only send phone number
    });

    const data = await response.json();
    
    if (response.ok) {
      showMessage('Phone number updated successfully');
    } else {
      showMessage(data.error || 'Failed to update phone number');
    }
  };

  return (
    <>
      <div>
        <label>Phone Number</label>
        <PhoneInput
          placeholder="Enter phone number"
          value={value}
          onChange={setValue}
          defaultCountry="ZA"
        />
        
        <button onClick={handleSave} className="save-settings-btn">
          Save Phone Number
        </button>
      </div>
      
      <MessageModal 
        isOpen={messageModalOpen}
        message={messageText}
        onClose={() => setMessageModalOpen(false)}
      />
    </>
  );
}

export default PhoneNoInput;