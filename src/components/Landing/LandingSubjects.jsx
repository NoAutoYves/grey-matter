import accounting from "../../assets/images/subject-images/accounting.png";
import business from "../../assets/images/subject-images/business.png";
import geography from "../../assets/images/subject-images/geography.png";
import economics from "../../assets/images/subject-images/economics.png";
import biology from "../../assets/images/subject-images/biology.png";
import phsyics from "../../assets/images/subject-images/physics.png";
import mathslit from "../../assets/images/subject-images/mathslit.png";
import maths from "../../assets/images/subject-images/maths.png";
import { Link } from "react-router-dom";

function LandingSubjects() {
    return(
        <>
          <section className="subjects">
            <Link to="/exercises/business/" className="subject-card">
                <img src={business} alt="Business Studies Exercises"/>
                <p>BUSINESS</p>
            </Link>

            <Link to="/exercises/accounting/" className="subject-card">
                <img src={accounting} alt="Accounting Studies Exercises"/>
                <p>ACCOUNTING</p>
            </Link>

            <Link to="/exercises/economics/" className="subject-card">
                <img src={economics} alt="Economics Exercises"/>
                <p>ECONOMICS</p>
            </Link>

            <Link to="/exercises/geography/" className="subject-card">
                <img src={geography} alt="Geography Exercises"/>
                <p>GEOGRAPHY</p>
            </Link>

            <Link to="/exercises/biology/" className="subject-card">
                <img src={biology} alt="Biology Exercises"/>
                <p>BIOLOGY</p>
            </Link>

            <Link to="/exercises/physics/" className="subject-card">
                <img src={phsyics} alt="Physics Exercises"/>
                <p>PHYSICS</p>
            </Link>

            <Link to="/exercises/maths-lit/" className="subject-card">
                <img src={mathslit} alt="Maths Literacy Exercises"/>
                <p>MATHS LITERACY</p>
            </Link>

            <Link to="/exercises/maths/" className="subject-card">
                <img src={maths} alt="Mathematics Exercises"/>
                <p>MATHEMATICS</p>
            </Link>
          </section>
        </>
    );
}

export default LandingSubjects;