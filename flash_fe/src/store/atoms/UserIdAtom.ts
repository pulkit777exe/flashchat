import { atom } from "recoil";

export const UserIdAtom = atom<string>({
  key: "UserId",
  default: ""
});
