import axios from 'axios';
import { v4 as uuidv4 } from "uuid";

export async function generateUUID() {
  const ssId = uuidv4();
  sessionStorage.setItem("ssId", ssId);
}

export const issueWidgetToken = async (ssId) => {
  try {
    const response = await axios.post(
      // 'https://asia-south1-neo-ji-152ee.cloudfunctions.net/anony-issue-token-fs-dev-v1',
      'https://asia-south1-neo-ji-152ee.cloudfunctions.net/anony-issue-token-fs-dev-v2',
      {session_id : ssId},
      {
        // headers: { Authorization: `Bearer ${token}` }, // example for auth
        // withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    // console.log('token issued:', response);
    return response.data;
  } catch (error) {
    console.error('Error issuing token:', error);
  }
};

//send-msg msg+token
//https://asia-south1-neo-ji-152ee.cloudfunctions.net/widget-send-message-fs-dev-v1

export const sendMessage = async (message, token) => {
  try {
    const response = await axios.post(
      'https://asia-south1-neo-ji-152ee.cloudfunctions.net/widget-send-message-fs-dev-v2',
      { message: message },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    // console.log('reply:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error issuing token:', error);
  }
};
