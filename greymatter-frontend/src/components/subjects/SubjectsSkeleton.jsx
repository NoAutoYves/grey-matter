import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import FuncHeader from "../functional-comps/FuncHeader";
import FuncFooter from "../functional-comps/FuncFooter";
import "../../styles/subjects/Subjects.css";

function SubjectsSkeleton() {
  return (
    <div className="subject-page">
      <FuncHeader />
      <section className="subjects-container">
        <Skeleton width={250} height={40} />
        <Skeleton width={400} height={20} style={{ marginBottom: '20px' }} />
        <div className="subjects-grid">
          <Skeleton count={8} height={220} style={{ marginBottom: '10px' }} />
        </div>
      </section>
      <FuncFooter />
    </div>
  );
}

export default SubjectsSkeleton;