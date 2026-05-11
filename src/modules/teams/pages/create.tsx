import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Users, Target, Save } from 'lucide-react';
import { TEAM_TEMPLATES, type Team } from '../types/team';

// Mock members data - in real app, this would come from API
const AVAILABLE_MEMBERS = [
  { id: 'M001', name: 'নাজরুল ইসলাম', email: 'nazrul@example.com', phone: '01711223344' },
  { id: 'M002', name: 'রহিম উদ্দিন', email: 'rahim@example.com', phone: '01712233344' },
  { id: 'M003', name: 'করিম আহমেদ', email: 'karim@example.com', phone: '01713334455' },
  { id: 'M004', name: 'আয়েশা বেগম', email: 'aisha@example.com', phone: '01714445566' },
  { id: 'M005', name: 'সজিব রহমান', email: 'sajib@example.com', phone: '01715556677' },
  { id: 'M006', name: 'ফাতেমা খাতুন', email: 'fatema@example.com', phone: '01716667788' },
];

export default function AddTeam() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Team>>({
    name: '',
    type: 'core',
    description: '',
    formationDate: new Date().toISOString().split('T')[0],
    status: 'active',
    members: [],
    responsibilities: [],
    performanceMetrics: [
      { target: 90, current: 0, unit: '%' },
      { target: 100, current: 0, unit: '%' }
    ]
  });

  const [newResponsibility, setNewResponsibility] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Auto-fill template when team type changes
  useEffect(() => {
    if (formData.type && TEAM_TEMPLATES[formData.type as keyof typeof TEAM_TEMPLATES]) {
      const template = TEAM_TEMPLATES[formData.type as keyof typeof TEAM_TEMPLATES];
      setFormData(prev => ({
        ...prev,
        name: template.name,
        description: template.description,
        members: template.defaultMembers.map((member: { role: any; duties: any; permissions: any; }) => ({
          id: '',
          name: '',
          role: member.role,
          duties: member.duties,
          permissions: member.permissions
        }))
      }));
    }
  }, [formData.type]);

  const handleAddResponsibility = () => {
    if (newResponsibility.trim()) {
      setFormData(prev => ({
        ...prev,
        responsibilities: [...(prev.responsibilities || []), newResponsibility.trim()]
      }));
      setNewResponsibility('');
    }
  };

  const handleRemoveResponsibility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities?.filter((_, i) => i !== index) || []
    }));
  };

  const handleAssignMember = () => {
    if (selectedMember && selectedRole) {
      const member = AVAILABLE_MEMBERS.find(m => m.id === selectedMember);
      const existingMemberIndex = formData.members?.findIndex(m => m.role === selectedRole);

      if (member && existingMemberIndex !== undefined && existingMemberIndex >= 0) {
        const updatedMembers = [...(formData.members || [])];
        updatedMembers[existingMemberIndex] = {
          ...updatedMembers[existingMemberIndex],
          id: member.id,
          name: member.name,
          email: member.email,
          phone: member.phone
        };

        setFormData(prev => ({
          ...prev,
          members: updatedMembers
        }));

        setSelectedMember('');
        setSelectedRole('');
      }
    }
  };

  const handleRemoveMember = (role: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members?.map(member => 
        member.role === role ? { ...member, id: '', name: '', email: '', phone: '' } : member
      ) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would save to database
    console.log('Team Data:', formData);
    alert('Team created successfully!');
    navigate('/teams');
  };

  const currentTemplate = formData.type ? TEAM_TEMPLATES[formData.type as keyof typeof TEAM_TEMPLATES] : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Team</h1>
          <p className="text-gray-600">Set up a new team with members, responsibilities and goals</p>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= stepNum ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-20 h-1 ${step > stepNum ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Basic Info</span>
            <span>Members</span>
            <span>Responsibilities</span>
            <span>Review</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Team Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Type *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="core">Core Management Team</option>
                    <option value="finance">Finance Team</option>
                    <option value="loan">Loan Management Team</option>
                    <option value="other">Other Team</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter team name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe the team's purpose and main objectives..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formation Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.formationDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, formationDate: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Template Preview */}
              {currentTemplate && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Template Preview</h3>
                  <p className="text-blue-700">{currentTemplate.description}</p>
                  <div className="mt-2 text-sm text-blue-600">
                    <strong>Default Roles:</strong> {currentTemplate.defaultMembers.map(m => m.role).join(', ')}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  Next: Assign Members
                  <Users size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Assign Members */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Assign Team Members</h2>
              
              {/* Member Assignment Interface */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Role
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="">Choose a role</option>
                      {formData.members?.map((member, index) => (
                        <option key={index} value={member.role}>
                          {member.role} {member.name && `(Currently: ${member.name})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Member
                    </label>
                    <select
                      value={selectedMember}
                      onChange={(e) => setSelectedMember(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="">Choose a member</option>
                      {AVAILABLE_MEMBERS.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name} ({member.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAssignMember}
                      disabled={!selectedMember || !selectedRole}
                      className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Assign Member
                    </button>
                  </div>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Team Members</h3>
                {formData.members?.map((member, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">{member.role}</h4>
                        {member.name ? (
                          <p className="text-green-600">{member.name} • {member.phone}</p>
                        ) : (
                          <p className="text-red-500">Not assigned</p>
                        )}
                      </div>
                      {member.name && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.role)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    <div className="text-sm text-gray-600">
                      <strong>Duties:</strong> {member.duties.join(', ')}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <strong>Permissions:</strong> {member.permissions.join(', ')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  Next: Responsibilities
                  <Target size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Responsibilities */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Team Responsibilities & Goals</h2>
              
              {/* Add Responsibility */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Team Responsibility
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newResponsibility}
                    onChange={(e) => setNewResponsibility(e.target.value)}
                    placeholder="e.g., Monthly financial reporting"
                    className="flex-1 p-3 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddResponsibility}
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Responsibilities List */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">Current Responsibilities</h3>
                {formData.responsibilities?.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No responsibilities added yet</p>
                ) : (
                  <div className="space-y-2">
                    {formData.responsibilities?.map((responsibility, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <span>{responsibility}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveResponsibility(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Performance Targets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.performanceMetrics?.map((metric, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target {index + 1}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={metric.target}
                          onChange={(e) => {
                            const newMetrics = [...(formData.performanceMetrics || [])];
                            newMetrics[index].target = Number(e.target.value);
                            setFormData(prev => ({ ...prev, performanceMetrics: newMetrics }));
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded"
                          placeholder="Target value"
                        />
                        <input
                          type="text"
                          value={metric.unit}
                          onChange={(e) => {
                            const newMetrics = [...(formData.performanceMetrics || [])];
                            newMetrics[index].unit = e.target.value;
                            setFormData(prev => ({ ...prev, performanceMetrics: newMetrics }));
                          }}
                          className="w-20 p-2 border border-gray-300 rounded"
                          placeholder="Unit"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  Next: Review & Create
                  <Save size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Create */}
          {step === 4 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Review Team Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Basic Information</h3>
                  <div className="space-y-2">
                    <p><strong>Team Name:</strong> {formData.name}</p>
                    <p><strong>Type:</strong> {formData.type}</p>
                    <p><strong>Description:</strong> {formData.description}</p>
                    <p><strong>Formation Date:</strong> {formData.formationDate}</p>
                    <p><strong>Status:</strong> {formData.status}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Members</h3>
                  <div className="space-y-2">
                    {formData.members?.map((member, index) => (
                      <div key={index} className="border-l-4 border-green-500 pl-3">
                        <p><strong>{member.role}:</strong> {member.name || 'Not assigned'}</p>
                        {member.name && <p className="text-sm text-gray-600">{member.phone}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">Responsibilities</h3>
                <div className="space-y-1">
                  {formData.responsibilities?.map((responsibility, index) => (
                    <p key={index}>• {responsibility}</p>
                  ))}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Save size={20} />
                  Create Team
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}