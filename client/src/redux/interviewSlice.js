import { createSlice } from "@reduxjs/toolkit";

export const interviewSlice = createSlice({
    name: "interview",
    initialState: {
        interviewData: null,
        feedbackData: null,
    },
    reducers: {
        setInterviewData: ((state, action) => {
            state.interviewData = action.payload;
        }),
        setFeedbackData: ((state, action) => {
            state.feedbackData = action.payload;
        })
    }
})

export const {setInterviewData, setFeedbackData} = interviewSlice.actions;
export default interviewSlice.reducer;