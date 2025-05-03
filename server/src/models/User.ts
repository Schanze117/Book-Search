import {Schema, model, type Document} from 'mongoose';
import bcrypt from 'bcrypt';

// Import the Book schema from the Books.js file
import {BookSchema} from './Books.js';
import type {Book} from './Books.js';

export interface user extends Document {
  username: string;
  email: string;
  id: string;
  password: string;
  savedBooks: Book[]; // Use the Book interface for savedBooks
    bookCount: number; // Add bookCount property
    comparePassword: (password: string) => Promise<boolean>; // Add comparePassword method
}

const UserSchema = new Schema<user>({
  username: {type: String, required: true, unique: true },
  email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    savedBooks: [BookSchema], // Use the Book schema for savedBooks
    bookCount: {type: Number, default: 0}, // Add bookCount property
});

// Hash the password before saving the user
UserSchema.pre<user>('save', async function (this: user, next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
}
);

// Compare the provided password with the hashed password
UserSchema.methods.comparePassword = async function (this: user, password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
}

UserSchema.virtual('bookCount').get(function (this: user) {
  return this.savedBooks.length; // Return the length of the savedBooks array
});

const User = model<user>('User', UserSchema);
export default User;