import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import FuncHeader from "../functional-comps/FuncHeader";
import FuncFooter from "../functional-comps/FuncFooter";
import "../../styles/exercise-completed/ExerciseCompleted.css";

function ExerciseCompletedSkeleton() {
  return (
    <div className="results-page">
      <FuncHeader />
      <section className="results-container">
        <Skeleton width={200} height={30} />
        <Skeleton width={150} height={20} style={{ marginBottom: '20px' }} />
        <div className="results-summary">
          <Skeleton count={3} height={80} style={{ marginRight: '10px' }} />
        </div>
        <Skeleton height={20} style={{ marginBottom: '10px' }} />
        <Skeleton height={150} style={{ marginBottom: '20px' }} />
        <Skeleton count={3} height={50} style={{ marginBottom: '10px' }} />
      </section>
      <FuncFooter />
    </div>
  );
}

export default ExerciseCompletedSkeleton;