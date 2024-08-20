import bcrypt from "bcrypt";

var saltRounds = 10;
export const hashPassword = async (password) => {
    var salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};
