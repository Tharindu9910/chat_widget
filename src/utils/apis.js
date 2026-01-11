import axios from 'axios';

export const issueWidgetToken = async () => {
  try {
    const response = await axios.post(
      'https://asia-south1-neo-ji-152ee.cloudfunctions.net/anony-issue-token-fs-dev-v1',
      {},
      {
        // headers: { Authorization: `Bearer ${token}` }, // example for auth
        // withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    console.log('token issued:', response);
    return response.data;
  } catch (error) {
    console.error('Error issuing token:', error);
  }
};

//send-msg msg+token
//https://asia-south1-neo-ji-152ee.cloudfunctions.net/widget-send-message-fs-dev-v1

export const sendMessage = async (message, tempssid) => {
  try {
    const response = await axios.post(
      'https://asia-south1-neo-ji-152ee.cloudfunctions.net/widget-send-message-fs-dev-temp',
      { message: message, session_id: tempssid },
      {
        headers: {
          Authorization: `Bearer token`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('reply:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error issuing token:', error);
  }
};
