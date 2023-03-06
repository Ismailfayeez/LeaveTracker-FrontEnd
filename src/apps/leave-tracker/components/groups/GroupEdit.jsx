import React, { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  addGroupMembers,
  createGroup,
  removeGroupMember,
  updateGroupInfo,
} from "../../store/groups";
import GroupMembers from "./GroupMembers";
import { filterAdmin, filterParticipant } from "./utils";
import { LocationContext } from "../../common/context/LocationContext";
import useValidator from "../../../../utilities/useValidator";
import groupDetailsSchema from "./groupDetailsForm.schema";
import { renderButton, renderInput } from "../../../../utilities/uiElements";
import "./groups.scss";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AddUsers from "../utilities/add-users/AddUsers";
import { useGlobalNavPages } from "../../../project/components/utilities/useGlobalNavPages";
import { MY_TEAM_URL } from "../../apiConstants";
import { LEAVETRACKER_PATH_NAMES } from "../../leaveTracker.constants";

function GroupEdit(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pages = ["addGroupInfo", "addUser"];
  const [currentLocation, setCurrentLocation] = useState(pages[0]);
  const [{ handleBack }] = useGlobalNavPages(LocationContext);
  const { groupsPathName, groupId } = useParams();
  const { myGroups: myGroupsPathName } = LEAVETRACKER_PATH_NAMES;
  const groupDetail = useSelector(
    (state) =>
      state.entities.leaveTracker.employeeAccountData.groups.detail.data
  );
  const [data, setData] = useState(groupDetail);
  const [errors, setErrors, validateForm, validateProperty] = useValidator(
    data,
    groupDetailsSchema
  );
  const currentUserData = useSelector(
    (state) => state.entities.auth.userProfile.currentUser.data
  );
  const adminList = filterAdmin(data.team_members);
  const memberList = filterParticipant(data.team_members);
  const isUserAdmin = adminList
    .map((admin) => admin.email)
    .includes(currentUserData.email);

  let baseUrl;
  if (groupsPathName == myGroupsPathName) baseUrl = MY_TEAM_URL;

  useEffect(() => {
    setData(groupDetail);
  }, [groupDetail]);

  const handleData = ({ currentTarget: input }) => {
    setData((prevData) => ({ ...prevData, [input.name]: input.value }));
  };

  const handleRemoveMember = async (memberId) => {
    try {
      dispatch(
        removeGroupMember({
          baseUrl: baseUrl + groupId + "/member/",
          memberId,
          groupId,
        })
      );
    } catch (err) {}
  };

  const handleSubmitGroup = async (teamMembers) => {
    if (groupId == "new") {
      const group = { ...data };
      group.team_members = [...teamMembers];
      try {
        await dispatch(createGroup({ url: baseUrl, data: group }));
        navigate("/lt/groups", { replace: true });
      } catch (err) {}
    } else {
      try {
        const url = baseUrl + groupId + "/member/";
        await dispatch(addGroupMembers({ url, data: teamMembers }));
        navigate("/lt/groups", { replace: true });
      } catch (err) {}
    }
  };

  const handleUpdateGroupInfo = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) return;
    try {
      await dispatch(updateGroupInfo({ baseUrl, id: groupId, data }));
      handleBack();
    } catch (err) {}
  };

  const handleNext = () => {
    const error = validateForm();
    if (error) return;
  };
  const handleBlur = ({ target: input }) => {
    validateProperty(input.name);
  };

  return (
    <section className="group-edit">
      {currentLocation == "addGroupInfo" && (
        <>
          <header className="flex flex--align-item-center">
            <div className="on-back-icon">
              <FontAwesomeIcon
                icon={faArrowLeft}
                onClick={groupId == "new" ? () => navigate(-1) : handleBack}
              />
            </div>
            <h4 className="title">
              {groupId == "new" ? "New Group" : groupDetail.name}
            </h4>
          </header>
          <form onSubmit={handleUpdateGroupInfo}>
            <div className="gr grid--1x2 grid--tablet grid-gap-10px-20px">
              {renderInput({
                name: "name",
                label: "Name",
                type: "text",
                className: "mb-1",
                data,
                handleChange: handleData,
                onBlur: handleBlur,
                errors,
              })}

              {renderInput({
                name: "description",
                label: "description",
                type: "text",
                className: "mb-1",
                data,
                handleChange: handleData,
                onBlur: handleBlur,
                errors,
              })}
            </div>
            {groupId != "new" && (
              <>
                <div className="flex flex--center flex-wrap btn-container btn-items-grow">
                  {renderButton({
                    type: "submit",
                    content: "save",
                    className: " btn--md btn--matte-black",
                  })}
                </div>
              </>
            )}
            {groupId == "new" && (
              <>
                <div className="flex flex--center flex-wrap btn-container btn-items-grow">
                  {renderButton({
                    type: "button",
                    onClick: handleNext,
                    content: "Nexat",
                    className: " btn--md btn--matte-black",
                  })}
                </div>
              </>
            )}
          </form>
          {groupDetail.team_members.length > 0 && (
            <div className="group-edit__participants">
              <div className="group-edit__participants-content">
                <GroupMembers
                  title="Admin(s)"
                  groupMembers={adminList}
                  isUserAdmin={isUserAdmin}
                />
                <GroupMembers
                  title="Members"
                  groupMembers={memberList}
                  isUserAdmin={isUserAdmin}
                  addAdmin={() => {}}
                  handleRemoveMember={handleRemoveMember}
                  allowEdit={true}
                />
              </div>
            </div>
          )}
          {groupId != "new" && (
            <div className="flex flex--center btn-container">
              {renderButton({
                type: "button",

                content: "Add",
                className: "btn--md btn--matte-black",
              })}
            </div>
          )}
        </>
      )}
      {currentLocation == "addUser" && (
        <AddUsers
          title={"Add Members"}
          handleSubmit={handleSubmitGroup}
          existingMembers={groupDetail.team_members}
        />
      )}
    </section>
  );
}

export default GroupEdit;