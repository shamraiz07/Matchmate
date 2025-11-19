import { BASE_URL } from "../../constants/config";

export const userRegistration = async (data: any) => {
  try {
    console.log('data of user registration', data);

    const response = await fetch(`${BASE_URL}/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),   // FIXED
    });

    const result = await response.json(); // FIXED

    console.log("Server Response:", result);

    if (!response.ok) {
      return { error: true, data: result };
    }

    return { error: false, data: result };

  } catch (error: any) {
    console.log("ERROR:", error);
    return { error: true, data: error };
  }
};

export const userLogin = async (data: any) => {
  try {
    console.log('data of user login', data);
    const response = await fetch(`${BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),   // FIXED
      });
  
      const result = await response.json(); 
  
      console.log("Server Response:", result);
  
      if (!response.ok) {
        return { error: true, data: result };
      }
  
      return { error: false, data: result };
  } catch (error: any) {
    console.log("ERROR:", error);
    return { error: true, data: error };
  }
};