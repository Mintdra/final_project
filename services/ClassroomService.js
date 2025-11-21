import api from './api';

export const classroomService = {
  joinClassroom: async (classCode) => {
    try {
      console.log('ClassroomService: Joining classroom with code:', classCode);
      console.log('ClassroomService: Sending POST request to /classrooms/join');

      const response = await api.post('/classrooms/join', { classCode });

      console.log('ClassroomService: Join response:', response.data);
      return response.data;
    } catch (error) {
      console.error('ClassroomService: Join classroom error:', error.message);

      if (error.response) {
        console.error('ClassroomService: Server error details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });

        // Provide specific guidance for authorization errors
        if (error.response.status === 401) {
          console.error('ClassroomService: 401 Unauthorized - Token may be missing, invalid, or expired');
          console.error('ClassroomService: Try logging out and logging back in');
        } else if (error.response.status === 403) {
          console.error('ClassroomService: 403 Forbidden - User may not have permission to join classrooms');
          console.error('ClassroomService: Check with your administrator or teacher');
        }
      } else if (error.request) {
        console.error('ClassroomService: No response received from server');
        console.error('ClassroomService: Check network connection');
      }

      throw error;
    }
  },

  getClassroomDetails: async (classroomId) => {
    const response = await api.get(`/classrooms/${classroomId}/details`);
    return response.data;
  },

  getClassroomMaterials: async (classroomId) => {
    const response = await api.get(`/classrooms/${classroomId}/materials`);
    return response.data;
  },

  getPracticeAssignments: async (classroomId) => {
    const response = await api.get(`/classrooms/${classroomId}/assignments`);
    return response.data;
  },

  getSubmissionAssignments: async (classroomId) => {
    const response = await api.get(
      `/classrooms/${classroomId}/assignments?type=submission`
    );
    return response.data;
  },

  getAllAssignments: async (classroomId) => {
    const [practice, submission] = await Promise.all([
      classroomService.getPracticeAssignments(classroomId),
      classroomService.getSubmissionAssignments(classroomId),
    ]);
    return [...practice, ...submission];
  },
};
