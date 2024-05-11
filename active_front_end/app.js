const API_URL = "https://active-grid-88d25cb4c783.herokuapp.com/api/v1/";

// Function to fetch motors from the backend and display them
async function fetchMotors() {
    try {
        const response = await axios.get(API_URL + 'motors');
        const data = response.data;

        const motorContainer = document.getElementById('motorContainer');
        motorContainer.innerHTML = ''; // Clear previous data

        data.forEach(motor => {
            const motorBox = createMotorBox(motor);
            motorContainer.appendChild(motorBox);
        });

        // Add click event listeners to motor boxes after they are created
        addClickListenersToMotors();
    } catch (error) {
        console.error('Error fetching motors:', error);
    }
}

// Function to create a motor box
function createMotorBox(motor) {
    const motorBox = document.createElement('div');
    motorBox.classList.add('motor-box');

    // Create content for the motor box
    const content = `
        <p><strong>Motor:</strong> ${motor.address}</p>
        <p><strong>Type:</strong> 
            <select class="type-select" data-address="${motor.address}">
                <option value="speed" ${motor.type === 'speed' ? 'selected' : ''}>Speed</option>
                <option value="pos" ${motor.type === 'pos' ? 'selected' : ''}>Position</option>
            </select>
        </p>
        <p><strong>Value:</strong> 
            <input type="number" class="value-input" value="${motor.value}" data-address="${motor.address}">
        </p>
        <button onclick="updateMotor(${motor.address})">Update</button>
        <button onclick="deleteMotor(${motor.address})">Delete</button>
    `;
    motorBox.innerHTML = content;
    motorBox.querySelector('.value-input').addEventListener('wheel', handleScroll2);

    return motorBox;
}

// Function to add click event listeners to motor boxes
function addClickListenersToMotors() {
    const motorBoxes = document.querySelectorAll('.motor-box');
    motorBoxes.forEach(motorBox => {
        motorBox.addEventListener('click', toggleSelectMotor);
    });
}

// Function to toggle motor selection
function toggleSelectMotor(event) {
  const addMotorForm = document.getElementById('addMotorForm');
  if (!event.target.classList.contains('value-input') && 
      !event.target.classList.contains('type-select') && 
      !addMotorForm.contains(event.target)) {
      this.classList.toggle('selected');
  }
}


// Function to update all selected motors with the slider value
document.getElementById('slider').addEventListener('input', function(event) {
    const sliderValue = event.target.value;
    const selectedMotors = document.querySelectorAll('.motor-box.selected');

    selectedMotors.forEach(motor => {
        const valueInput = motor.querySelector('.value-input');
        valueInput.value = sliderValue;
    });
    
});

document.addEventListener('DOMContentLoaded', function() {
    const typeSelect = document.getElementById('type-select');
    const slider = document.getElementById('slider');
    const sliderValue = document.getElementById('sliderValue');

    function updateSliderAttributes() {
        switch (typeSelect.value) {
            case 'speed':
                slider.min = "0";
                slider.max = "240";
                slider.value = 0;
                sliderValue.textContent = `${slider.value} RPM`;
                break;
            case 'pos':
                slider.min = "-180";
                slider.max = "180";
                slider.value = 0;
                sliderValue.textContent = `${slider.value}°`;
                break;
            default:
                slider.min = "0";
                slider.max = "240";
                slider.value = 0;
                sliderValue.textContent = `${slider.value} RPM`;
                break;
        }
        slider.value = 0;
    }

    // Event listener for the dropdown changes
    typeSelect.addEventListener('change', updateSliderAttributes);

    // Event listener for the slider changes
    slider.addEventListener('input', function() {
        const unit = typeSelect.value === 'speed' ? ' RPM' : '°';
        sliderValue.textContent = `${slider.value}${unit}`;
    });

    // Initialize slider attributes on load
    updateSliderAttributes();
});




// Function to change the type of selected motors
document.getElementById('type-select').addEventListener('change', function(event) {
    const newType = event.target.value;
    const selectedMotors = document.querySelectorAll('.motor-box.selected');
    changeType(selectedMotors, newType);
});

// Function to change the type of selected motors
function changeType(selectedMotors, newType) {
    selectedMotors.forEach(motor => {
        const typeSelect = motor.querySelector('.type-select');
        typeSelect.value = newType;
    });
}

// Function to update a motor
async function updateMotor(motorAddress) {
    const typeSelect = document.querySelector(`.type-select[data-address="${motorAddress}"]`);
    const valueInput = document.querySelector(`.value-input[data-address="${motorAddress}"]`);

    const updatedType = typeSelect.value;
    const updatedValue = valueInput.value;

    try {
        const response = await axios.patch(API_URL + `motors/${motorAddress}`, {
            address: parseInt(motorAddress),
            type: updatedType,
            value: parseInt(updatedValue) // Convert value to integer
        });

        console.log('Motor updated:', response.data);
        fetchMotors(); // Refresh motor list after updating
    } catch (error) {
        console.error('Error updating motor:', error);
    }
}

// Function to delete a motor
async function deleteMotor(motorAddress) {
    console.log('Delete motor with ID:', motorAddress);
    try {
        const response = await axios.delete(API_URL + `motors/${motorAddress}`);
        const data = response.data;

        console.log('Motor deleted:', data);
        fetchMotors(); // Refresh motor list after deletion
    } catch (error) {
        console.error('Error deleting motor:', error);
    }
}

// Function to add a new motor
async function addMotor(event) {
    event.preventDefault();
    const form = document.getElementById('addMotorForm');
    const formData = new FormData(form);
    console.log(formData)
    try {
        const response = await axios.post(API_URL + 'motors', Object.fromEntries(formData));
        const data = response.data;

        console.log('New motor added:', data);
        fetchMotors(); // Refresh motor list after adding
        form.reset(); // Clear form fields
    } catch (error) {
        console.error('Error adding motor:', error);
    }
}
// Function to handle scroll wheel event on input fields and slider
function handleScroll(event) {
    
  const target = event.target;
  const step = parseInt(target.step) || 1; // Get step attribute or default to 1
  let currentValue = parseInt(target.value) || 0;

  // Calculate the new value based on the scroll direction
  const direction = event.deltaY > 0 ? -1 : 1;
  const newValue = currentValue + direction * step;

  // Update the target value with the new value
  target.value = newValue;
  const selectedMotors = document.querySelectorAll('.motor-box.selected');
  selectedMotors.forEach(motor => {
  const valueInput = motor.querySelector('.value-input');
  valueInput.value = newValue;
  });
  
}

// Function to handle scroll wheel event on input fields and slider
function handleScroll2(event) {
  const target = event.target;
  const step = parseInt(target.step) || 1; // Get step attribute or default to 1
  let currentValue = parseInt(target.value) || 0;

  // Calculate the new value based on the scroll direction
  const direction = event.deltaY > 0 ? -1 : 1;
  const newValue = currentValue + direction * step;

  // Update the target value with the new value
  target.value = newValue;
}

// Add event listeners to input fields and slider for scroll wheel
const valueInputs = document.querySelectorAll('.value-input');
valueInputs.forEach(input => {
  input.addEventListener('wheel', handleScroll2);
});

const slider = document.getElementById('sliderContainer');
slider.addEventListener('wheel', handleScroll);


// Function to update all selected motors with the provided type and value
function updateSelectedMotors(type, value) {
  const selectedMotors = document.querySelectorAll('.motor-box.selected');

  selectedMotors.forEach(motor => {
      const typeSelect = motor.querySelector('.type-select');
      const valueInput = motor.querySelector('.value-input');

      typeSelect.value = type;
      valueInput.value = value;
  });
}

// Example usage:
// Update all selected motors to have type 'speed' and value 50
//updateSelectedMotors('speed', 50);



// Function to update all selected motors on the backend
async function updateSelectedMotorsBackend() {
  const selectedMotors = document.querySelectorAll('.motor-box.selected');
  const updates = [];

  selectedMotors.forEach(motor => {
      const motorAddress = motor.querySelector('.value-input').getAttribute('data-address');
      const typeSelect = motor.querySelector('.type-select');
      const valueInput = motor.querySelector('.value-input');

      updates.push({
          address: parseInt(motorAddress),
          type: typeSelect.value,
          value: parseInt(valueInput.value)
      });
  });

  try {
      // Send updates to the backend
      await Promise.all(updates.map(update => updateMotor(update.address, update)));
      console.log('Motors updated on the backend');
  } catch (error) {
      console.error('Error updating motors on the backend:', error);
  }
}




// Example usage:
// Update all selected motors on the backend
//updateSelectedMotorsBackend();

// Fetch motors when the page loads
window.onload = fetchMotors;

// Add event listener to the form submission
document.getElementById('addMotorForm').addEventListener('submit', addMotor);

document.getElementById('batchupdatebutton').addEventListener('click', updateSelectedMotorsBackend);