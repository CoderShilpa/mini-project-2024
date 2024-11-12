// Handle officer login
document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:5001/api/officer/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username, password: password }),
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();  // Assuming the token is returned in the response body
      localStorage.setItem('token', data.token);  // Store the token in localStorage
      console.log('Login successful');
    }
     else {
      console.error('Invalid login credentials');
      alert('Invalid login credentials');
    }
  } catch (error) {
    console.error('Login error:', error);
  }
});

// Function to fetch complaints and display them
console.log("hello");
// Function to fetch complaints and display them
async function fetchComplaints() {
  try {
    // Get the token from localStorage (or from wherever you store it)
    const token = localStorage.getItem('token');  // Ensure the token is correctly stored after login

    // Fetch complaints with the token in the Authorization header
    const response = await fetch('http://localhost:5001/api/complaints', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`  // Add token here
      },
      credentials: 'include'  // Ensure the officer's session cookie is sent
    });

    if (response.ok) {
      const complaints = await response.json();
      console.log('Complaints fetched:', complaints);
      const complaintsList = document.getElementById('complaintsList');
      complaintsList.innerHTML = ''; // Clear existing complaints if any

      // Loop through complaints and add them to the page
      complaints.forEach((complaint) => {
        const complaintElement = document.createElement('div');
        complaintElement.classList.add('complaint');
        complaintElement.innerHTML = `
          <h3>${complaint.title}</h3>
          <p><strong>Name:</strong> ${complaint.name}</p>
          <p><strong>Address:</strong> ${complaint.address}</p>
          <p><strong>Contact:</strong> ${complaint.contact}</p>
          <p><strong>Description:</strong> ${complaint.description}</p>
        `;
        complaintsList.appendChild(complaintElement);
      });
    } else {
      console.error('Failed to fetch complaints. Status:', response.status);
      alert('Failed to fetch complaints');
    }
  } catch (error) {
    console.error('Error fetching complaints:', error);
  }
}


// Handle officer logout
document.getElementById('logoutButton').addEventListener('click', async () => {
  try {
    const response = await fetch('http://localhost:5001/api/officer/logout', {
      method: 'POST',
      credentials: 'include'  // Include session cookie in logout request
    });

    if (response.ok) {
      console.log('Logout successful');
      // Show login form again and hide complaints container
      document.getElementById('loginForm').style.display = 'block';
      document.getElementById('complaintsContainer').style.display = 'none';
    } else {
      console.error('Error logging out');
      alert('Error logging out');
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
});
