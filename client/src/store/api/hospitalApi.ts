import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { HospitalFound } from '../../types';

interface GetDistrictsArgs {
    state: string;
}

interface GetHospitalsArgs {
    state: string;
    district: string;
}

export const hospitalApi = createApi({
    reducerPath: 'hospitalApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api/hospital' }),
    endpoints: (builder) => ({
        getStates: builder.query<string[], void>({
            query: () => '/states',
        }),
        getDistricts: builder.query<string[], GetDistrictsArgs>({
            query: ({ state }) => ({
                url: '/districts',
                method: 'POST',
                body: { state },
            }),
        }),
        getHospitals: builder.query<HospitalFound[], GetHospitalsArgs>({
            query: ({ state, district }) => ({
                url: '/hospitals',
                method: 'POST',
                body: { state, district },
            }),
            transformResponse: (response: HospitalFound[]) => {
                return response.map((hospital) => ({
                    _id: hospital._id,
                    hospital_name: hospital.hospital_name || 'Hospital Name not available',
                    address: (hospital.state + ', ' + hospital.district) || 'Address not available',
                    lat: hospital.lat || 0,
                    long: hospital.long || 0,
                    state: hospital.state,
                    district: hospital.district,
                }));
            },
        }),
    }),
});

export const {
    useGetStatesQuery,
    useGetDistrictsQuery,
    useGetHospitalsQuery,
} = hospitalApi;
