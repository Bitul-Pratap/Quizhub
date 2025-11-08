import connectDB from '@/db/connectDb';
import User from '@/models/User';
import NextAuth from 'next-auth'
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from 'bcrypt';

export const authOptions = NextAuth({
    providers:[
        CredentialsProvider({
            
            name: "credentials",
            credentials: {},

            async authorize(credentials){
                const {email, password} = credentials;
                // console.log(credentials);
            try {
                await connectDB();
                const user = await User.findOne({email: email});
                // console.log(user);
                if(!user)
                    throw new Error('User not found');

                const passwordMatch = await bcrypt.compare(password, user.password);
                // console.log(passwordMatch)
                if(!passwordMatch)
                    throw new Error('Invalid credentials');

                return {name: user.name, email: user.email, user_type: user.user_type };
            } catch (error) {
                console.log("Error in authorize:", error);
                if(!error.message)
                    throw new Error('An unexpected error occurred');
                else{
                    throw new Error(error.message);
                }
            }    
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages:{
        signIn: "/login",
    },
    callbacks:{
        async session({session, user, token}){
            const dbUser = await User.findOne({email: session.user.email})
            // console.log("dbuser", dbUser);
            const userTypes = dbUser.user_type.map((type) => ({
                type: type.type,
                rights: type.rights
            }));
            session.user.user_type = userTypes;
            // console.log("seesion", session);
            // console.log("session", session, user, token);
            return session;
        }
    }
})

export {authOptions as GET, authOptions as POST};
