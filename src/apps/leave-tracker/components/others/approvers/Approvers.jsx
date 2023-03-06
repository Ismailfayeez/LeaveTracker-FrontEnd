import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeApprover } from "../../../store/employeeProfile";
import "./approver.scss";
import { leaveTrackerModalNames } from "../../../leaveTracker.constants";
import { APPROVER_URL } from "../../../apiConstants";
import ApproverCard from "../../../../../ui-kit/cards/apps/leavetracker/approver-card/ApproverCard";
import { ModalNavContext } from "../../../../../utilities/context/ModalNavContext";
import { useModalNav } from "../../../../../utilities/hooks/useModalNav";
import { useState } from "react";
import AddButton from "../../../../../ui-kit/button/add-button/AddButton";
import { ReactComponent as AddTasksImg } from "../../../../../assets/images/add-tasks.svg";
function Approvers(props) {
  const dispatch = useDispatch();
  const [{ openModal, moveToNextNav }] = useModalNav(ModalNavContext);
  const [loadingId, setLoadingId] = useState("");

  const approvers = useSelector(
    (state) =>
      state.entities.leaveTracker.employeeAccountData.employeeProfile
        .currentEmployee.data.approvers
  );

  const handleAddApprover = () => {
    openModal();
    moveToNextNav({}, leaveTrackerModalNames.addApprovers);
  };
  const handleRemoveApprover = async (id) => {
    try {
      setLoadingId(id);
      await dispatch(removeApprover({ baseUrl: APPROVER_URL, id }));
    } catch (err) {
      console.log(err);
    }
    setLoadingId("");
  };
  return (
    <div className="approvers page-layout gap--1rem">
      <header className="page-layout__header">
        <div className="flex flex--space-between-align-center">
          <h3 className="margin-zero">Approvers</h3>
          {approvers.length > 0 && (
            <AddButton
              content="Add"
              onClick={handleAddApprover}
              iconOnMobileScreen
            />
          )}
        </div>
      </header>
      <main className="page-layout__main">
        {approvers.length <= 0 && (
          <div className="flex flex--column flex--center gap--1rem">
            <AddTasksImg className="illustration base-size" />
            <AddButton content="Add Approver" onClick={handleAddApprover} />
          </div>
        )}
        <div className="grid grid--1x2 gap--1rem grid--tablet">
          {approvers.length > 0 &&
            approvers.map((approver) => (
              <ApproverCard
                approver={approver}
                enableRemoveBtn={true}
                handleRemove={() => handleRemoveApprover(approver.id)}
                loading={loadingId == approver.id}
              />
            ))}
        </div>
      </main>
    </div>
  );
}

export default Approvers;