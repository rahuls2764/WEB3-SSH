export const chunkCourseForVector = (course) => {
    const chunks = [];
  
    if (course.title) chunks.push(`Course Title: ${course.title}`);
    if (course.description) chunks.push(`Course Description: ${course.description}`);
    if (Array.isArray(course.prerequisites)) {
      chunks.push(`Prerequisites: ${course.prerequisites.join(', ')}`);
    } else if (typeof course.prerequisites === 'string') {
      chunks.push(`Prerequisites: ${course.prerequisites}`);
    }
        if (Array.isArray(course.syllabus)) {
      course.syllabus.forEach((item, i) => {
        chunks.push(`Syllabus ${i + 1}: ${item.title} - ${item.duration}`);
      });
    }
    if (Array.isArray(course.learningOutcomes)) {
      chunks.push(`Learning Outcomes: ${course.learningOutcomes.join(', ')}`);
    }
  
    return chunks;
  };
  