import axios from "axios";

const sendRect = (rect) => {
  return axios.post(
    "https://greensysforus.xyz/aml2-api-dev/extract_block/ ",
    JSON.stringify(rect),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export { sendRect };
