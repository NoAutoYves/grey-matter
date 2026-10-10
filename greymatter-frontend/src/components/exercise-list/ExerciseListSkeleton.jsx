import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import FuncHeader from "../functional-comps/FuncHeader";
import FuncFooter from "../functional-comps/FuncFooter";
import "../../styles/exercise-list/ExerciseList.css";

function ExerciseListSkeleton() {
  return (
    <div className="list-page">
      <FuncHeader />
      <section className="list-container">
        <Skeleton width={250} height={40} />
        <Skeleton width={400} height={20} style={{ marginBottom: '20px' }} />
        <div className="topics-grid">
          <Skeleton count={6} height={100} style={{ marginBottom: '10px' }} />
        </div>
      </section>
      <FuncFooter />
    </div>
  );
}

export default ExerciseListSkeleton;