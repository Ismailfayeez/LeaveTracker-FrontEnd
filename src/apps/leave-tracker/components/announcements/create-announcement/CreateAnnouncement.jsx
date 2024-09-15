import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import AnnouncementForm from '../announcement-form/AnnouncementForm';
import Modal from '../../../../../ui-kit/modal/Modal';
import { loadData } from '../../../../../store/common/dispatchMethods';
import { AddQueryParamToUrl } from '../../../../../utilities/queryParamGenerator';
import { MY_TEAM_URL } from '../../../apiConstants';
import useValidator from '../../../../../utilities/hooks/useValidator';
import createAnnouncementSchema from '../announcement-form/createAnnouncement.schema';
import { createAnnouncement } from '../../../store/announcements';
import useModalNav from '../../../../../utilities/hooks/useModalNav';
import ModalNavContext from '../../../../../utilities/context/ModalNavContext';
import SearchList from '../../../utilities/components/search-list/SearchList';

function CreateAnnouncement() {
  const initialState = {
    title: '',
    message: '',
    teams: [],
    expiryDate: '',
    priority: ''
  };
  const dispatch = useDispatch();
  const [data, setData] = useState(initialState);
  const [{ closeModal }] = useModalNav(ModalNavContext);
  const [errors, validateForm, validateProperty] = useValidator(data, createAnnouncementSchema);
  const [displaySearchGroups, setDisplaySearchGroups] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const handleDisplaySearchGroups = () => setDisplaySearchGroups(!displaySearchGroups);
  const handleBlur = useCallback(
    ({ currentTarget: input }) => {
      validateProperty(input.name);
    },
    [validateProperty]
  );
  const handleSelected = (teams) => {
    const newTeamList = [...data.teams, ...teams];
    console.log('Selected', newTeamList);
    setData({ ...data, teams: newTeamList });
    handleDisplaySearchGroups();
  };

  const onSearch = (input) =>
    dispatch(loadData(AddQueryParamToUrl(MY_TEAM_URL, { search: input.value })));

  const handleChange = ({ target: input }) => setData({ ...data, [input.name]: input.value });

  const handleRemoveTeam = (id) => {
    const removedTeamData = data.teams.filter((team) => team.id !== id);
    setData({ ...data, teams: removedTeamData });
    handleBlur({ currentTarget: { name: 'teams', value: removedTeamData } });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) return;
    setIsSubmitLoading(true);
    try {
      const { title, message, priority, expiryDate, teams } = data;
      const postData = {
        title,
        message,
        priority,
        expiry_date: expiryDate,
        team_list: teams.map((team) => team.id)
      };
      await dispatch(createAnnouncement(postData));
      closeModal();
      toast.success(<span className="toast-msg">Announcement created successfully</span>);
    } catch (err) {}
    setIsSubmitLoading(false);
  };
  console.log(data);
  return (
    <>
      {displaySearchGroups && (
        <Modal
          open={displaySearchGroups}
          handleClose={handleDisplaySearchGroups}
          height="lg"
          width="sm"
          title="Search Groups">
          <SearchList
            onSearch={onSearch}
            handleSelected={handleSelected}
            existingList={data.teams}
            existingListMatchField="id"
            idField="id"
            titleField="name"
            subTitleField="description"
          />
        </Modal>
      )}
      <AnnouncementForm
        data={data}
        isSubmitLoading={isSubmitLoading}
        errors={errors}
        handleChange={handleChange}
        handleBlur={handleBlur}
        handleDisplaySearchGroups={handleDisplaySearchGroups}
        handleRemoveTeam={handleRemoveTeam}
        handleSubmit={handleSubmit}
      />
    </>
  );
}

export default CreateAnnouncement;
