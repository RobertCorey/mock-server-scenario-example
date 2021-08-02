import { setupWorker } from "msw";
export default process.env.REACT_APP_MOCK && setupWorker();
