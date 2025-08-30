import bcrypt from "bcrypt";

const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<Boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export default comparePassword;
