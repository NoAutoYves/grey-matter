function ExerciseInfoBar({ exercise }) {
  if (!exercise) return null;

  const { exercise_title, exercise_name } = exercise;

  const match = exercise_title?.match(/^(.+?) \(Grade (\d+) (.+?)\) - Exercise (\d+)$/);

  const topicName = match ? match[1] : (exercise_title || exercise_name || "Exercise");
  const grade = match ? match[2] : null;
  const subjectDisplay = match ? match[3] : null;
  const exerciseNumber = match ? match[4] : null;

  return (
    <div className="exercise-info-bar">
      {subjectDisplay && grade && (
        <span className="exercise-info-subject">{subjectDisplay} - Grade {grade}</span>
      )}
      <span className="exercise-info-topic">
        {topicName}{exerciseNumber ? ` - Exercise ${exerciseNumber}` : ""}
      </span>
    </div>
  );
}

export default ExerciseInfoBar;