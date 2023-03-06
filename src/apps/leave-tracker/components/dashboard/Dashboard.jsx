import React from "react";
import EmployeeInfo from "./employee-Info/EmployeeInfo";
import "./dashboard.scss";
import "../leaveTracker.scss";
import Absentees from "./absentees/Absentees";
import AbsenteesGroupLevelAnalysis from "./absentees/absentees-group-level-analysis/AbsenteesGroupLevelAnalysis";
import { useSelector } from "react-redux";
import { getLastName } from "../../../../utilities/helper";

function Dashboard(props) {
  const currentUser = useSelector(
    (state) => state.entities.auth.userProfile.currentUser.data
  );
  const lastName = getLastName(currentUser.username);
  return (
    <div className="dashboard page-layout">
      <header>
        <h3 className="page-layout__header">Hello, {lastName}</h3>
      </header>
      <main className="page-layout__main flex flex--column gap--2rem">
        <Absentees />
        <EmployeeInfo />
        <AbsenteesGroupLevelAnalysis />
      </main>
    </div>
  );
}

export default Dashboard;