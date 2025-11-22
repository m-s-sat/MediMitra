import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User, UserQuery, Hospital, Doctor, SignupRequest } from '../../types';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api/auth' }),
    tagTypes: ['User', 'Hospital'],
    endpoints: (builder) => ({
        checkUserStatus: builder.query<User | Hospital | null, void>({
            query: () => '/check',
            providesTags: ['User', 'Hospital'],
            transformResponse: (response: any) => {
                // The backend seems to return the user object directly or wrapped.
                // Based on AuthContext: if(userData.role === 'patient') setUser(userData);
                // So it returns the user object.
                return response;
            },
        }),
        login: builder.mutation<User | Hospital, UserQuery>({
            query: (credentials) => ({
                url: '/login',
                method: 'POST',
                body: {
                    username: credentials.email,
                    password: credentials.password,
                },
            }),
            invalidatesTags: ['User', 'Hospital'],
        }),
        signup: builder.mutation<User, SignupRequest>({
            query: (userData) => ({
                url: '/register',
                method: 'POST',
                body: {
                    username: userData.email,
                    name: userData.name,
                    password: userData.password,
                    confirmPassword: userData.password,
                    phone: userData.phone,
                    preferredLanguage: userData.preferredLanguage,
                    avatar: userData.avatar,
                    dob: userData.dob,
                    pincode: userData.pincode,
                    role: userData.role,
                },
            }),
            invalidatesTags: ['User'],
        }),
        logout: builder.mutation<void, void>({
            query: () => ({
                url: '/logout',
                method: 'GET', // AuthContext uses default fetch which is GET
            }),
            invalidatesTags: ['User', 'Hospital'],
        }),
        updateUser: builder.mutation<User, Partial<User>>({
            query: (userData) => ({
                url: '/profileupdate',
                method: 'PATCH',
                body: userData,
            }),
            invalidatesTags: ['User'],
            transformResponse: (response: { data: User }) => response.data,
        }),
        hospitalSignup: builder.mutation<Hospital, Hospital>({
            query: (hospitalData) => ({
                url: '/hospitalreg',
                method: 'POST',
                body: hospitalData,
            }),
            invalidatesTags: ['Hospital'],
            transformResponse: (response: { data: Hospital }) => response.data,
        }),
        addDoctor: builder.mutation<Hospital, Doctor>({
            query: (doctorData) => ({
                url: '/update/doctor',
                method: 'PATCH',
                body: doctorData,
            }),
            invalidatesTags: ['Hospital'],
            transformResponse: (response: { data: Hospital }) => response.data,
        }),
        updateHospital: builder.mutation<Hospital, Partial<Hospital>>({
            query: (hospitalData) => ({
                url: '/hospital/update',
                method: 'PATCH',
                body: hospitalData,
            }),
            invalidatesTags: ['Hospital'],
            transformResponse: (response: { data: Hospital }) => response.data,
        }),
    }),
});

export const {
    useCheckUserStatusQuery,
    useLoginMutation,
    useSignupMutation,
    useLogoutMutation,
    useUpdateUserMutation,
    useHospitalSignupMutation,
    useAddDoctorMutation,
    useUpdateHospitalMutation,
} = authApi;
