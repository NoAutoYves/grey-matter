// subjectMap.js
export const subjectNameMap = {
    'accounting': 'Accounting',
    'business': 'Business',
    'economics': 'Economics',
    'geography': 'Geography',
    'life-science': 'Life Science',
    'biology': 'Life Science',  // Alias for biology
    'physics': 'Physics',
    'mathematics': 'Mathematics',
    'maths': 'Mathematics',     // Alias for maths
    'mathematical-literacy': 'Mathematical Literacy',
    'maths-lit': 'Mathematical Literacy'  // Alias for maths-lit
};

export const getSubjectName = (slug) => {
    return subjectNameMap[slug.toLowerCase()] || slug;
};