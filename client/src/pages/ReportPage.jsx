import React from 'react';
import { useSelector } from 'react-redux';

const ReportPage = () => {
    const feedbackData = useSelector((state) => state.interview.feedbackData);
    console.log(feedbackData)
    return <div>Report page</div>
}

export default ReportPage;