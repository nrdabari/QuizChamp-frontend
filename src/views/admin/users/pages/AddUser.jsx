import { useFormik } from "formik";
import { sourceOptions, words } from "../../../../helper/helpers";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { ROLES } from "../../../../constants/enum";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useApiService } from "../../../../hooks/useApiService";
import ExcelJS from "exceljs";

const AddUser = () => {
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const isEditMode = location.pathname.includes("edit");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userDataLoaded, setUserDataLoaded] = useState(false); // Add this state
  const { admin } = useApiService();

  const exportUserToExcel = (userData) => {
    const wb = ExcelJS.utils.book_new();

    const excelData = [
      {
        "Full Name": userData.name,
        "Email Address": userData.email,
        "Login Password": userData.password,
        "Account Status": "Active",
        "Created On": new Date().toLocaleDateString(),
        Instructions: "Please keep this information secure",
      },
    ];

    const ws = ExcelJS.utils.json_to_sheet(excelData);

    // Style the header row
    const range = ExcelJS.utils.decode_range(ws["!ref"]);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = ExcelJS.utils.encode_col(C) + "1";
      if (!ws[address]) continue;
      ws[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "CCCCCC" } },
      };
    }

    ws["!cols"] = [
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 15 },
      { wch: 25 },
    ];

    ExcelJS.utils.book_append_sheet(wb, ws, "User Credentials");

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `UserCredentials_${userData.name.replace(
      /\s+/g,
      "_"
    )}_${timestamp}.xlsx`;

    ExcelJS.writeFile(wb, filename);
  };

  const initialFormValues = {
    name: "",
    email: "",
    grade: "",
    role: ROLES.USER,
    subjectsAccess: [],
    sourceAccess: [],
    password: "",
    confirmPassword: "",
    isActive: true,
  };
  const formik = useFormik({
    initialValues: initialFormValues,
    validate: (values) => {
      const errors = {};
      if (!values.name) errors.name = "Name is required";
      if (!values.email) errors.email = "Email is required";
      if (!values.grade) errors.grade = "Grade is required";
      if (!isEditMode && !values.password)
        errors.password = "Password is required";
      return errors;
    },
    onSubmit: async (values) => {
      try {
        setLoading(true);
        if (isEditMode) {
          await admin.updateUser(params.id, values);
          navigate("/admin/users");
        } else {
          await admin.createUser(values);
          const userData = {
            name: values.name,
            email: values.email,
            password: values.password, // Store plain password for Excel
          };
          exportUserToExcel(userData);
          navigate("/admin/users");
        }
      } catch (error) {
        console.error("Error saving user:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  // Fetch subjects when grade changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (formik.values.grade) {
        const grade = parseInt(formik.values.grade);
        try {
          const subjectData = await admin.getSubjects(grade);
          const filteredSubjects = subjectData?.filter((subject) =>
            subject?.classLevels?.includes(grade)
          );
          setAvailableSubjects(filteredSubjects || []);
        } catch (error) {
          console.error("Error fetching subjects:", error);
          setAvailableSubjects([]);
        }
      } else {
        setAvailableSubjects([]);
      }
    };

    fetchSubjects();
  }, [formik.values.grade]);

  // Separate useEffect to filter existing subjects only after both user data and subjects are loaded
  useEffect(() => {
    if (
      isEditMode &&
      userDataLoaded &&
      availableSubjects.length > 0 &&
      formik.values.subjectsAccess?.length > 0
    ) {
      // Filter subjects only if current selections are not valid for the new grade
      const validSubjects = formik.values.subjectsAccess.filter((subjectId) =>
        availableSubjects.some(
          (s) => s._id?.toString() === subjectId?.toString()
        )
      );

      // Only update if there's a mismatch (some subjects are invalid for this grade)
      if (validSubjects.length !== formik.values.subjectsAccess.length) {
        formik.setFieldValue("subjectsAccess", validSubjects);
      }
    }
  }, [availableSubjects, userDataLoaded, isEditMode]);

  const generatePassword = () => {
    const word1 = words[Math.floor(Math.random() * words.length)];
    const word2 = words[Math.floor(Math.random() * words.length)];
    const number1 = Math.floor(Math.random() * 100);
    const number2 = Math.floor(Math.random() * 100);

    const password = `${word1}${word2}${number1}${number2}`;
    formik.setFieldValue("password", password);
  };

  const handleSubjectChange = (subjectId) => {
    const subjectIdString = subjectId?.toString();
    const subjectsAccess = formik.values.subjectsAccess?.includes(
      subjectIdString
    )
      ? formik.values.subjectsAccess.filter((id) => id !== subjectIdString)
      : [...(formik.values.subjectsAccess || []), subjectIdString];
    formik.setFieldValue("subjectsAccess", subjectsAccess);
  };

  const handleSourceChange = (source) => {
    const sourceAccess = formik.values.sourceAccess.includes(source)
      ? formik.values.sourceAccess.filter((s) => s !== source)
      : [...formik.values.sourceAccess, source];
    formik.setFieldValue("sourceAccess", sourceAccess);
  };

  const handleCancel = () => {
    navigate("/admin/users");
  };

  // Load user data for edit mode
  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        setUserDataLoaded(false);

        if (isEditMode && params.id) {
          const resp = await admin.getUserById(params.id);
          const userData = resp?.data;

          formik.setValues({
            name: userData?.name || "",
            email: userData?.email || "",
            grade: userData?.grade || "",
            role: userData?.role || ROLES.USER,
            password: "",
            confirmPassword: "",
            subjectsAccess:
              userData?.subjectsAccess?.map((id) => id.toString()) || [], // Ensure strings
            sourceAccess: userData?.sourceAccess || [],
            isActive: userData?.isActive ?? true,
          });
        }

        setUserDataLoaded(true); // Mark as loaded after setting values
        setLoading(false);
      } catch (error) {
        console.log("error", error);
        setLoading(false);
        setUserDataLoaded(true);
        navigate("/admin/users");
      }
    };

    getData();
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Users</span>
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Edit User" : "Add New User"}
          </h1>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={formik.handleSubmit} autoComplete="off">
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {formik.errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                    {formik.touched.email && formik.errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {formik.errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade *
                    </label>
                    <select
                      name="grade"
                      value={formik.values.grade}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Grade</option>
                      {[1, 2, 3, 4, 5].map((grade) => (
                        <option key={grade} value={grade}>
                          Grade {grade}
                        </option>
                      ))}
                    </select>
                    {formik.touched.grade && formik.errors.grade && (
                      <p className="mt-1 text-sm text-red-600">
                        {formik.errors.grade}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      name="role"
                      value={formik.values.role}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={ROLES.USER}>User</option>
                      <option value={ROLES.ADMIN}>Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="flex items-center space-x-3 mt-3">
                      <button
                        type="button"
                        onClick={() =>
                          formik.setFieldValue(
                            "isActive",
                            !formik.values.isActive
                          )
                        }
                        className={`flex items-center space-x-2 ${
                          formik.values.isActive
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formik.values.isActive ? (
                          <ToggleRight size={24} />
                        ) : (
                          <ToggleLeft size={24} />
                        )}
                        <span className="text-gray-900 font-medium">
                          {formik.values.isActive ? "Active" : "Inactive"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subjects */}
              {availableSubjects?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Subjects Access
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableSubjects?.map((subject) => (
                      <label
                        key={subject?._id}
                        className="flex items-center space-x-2 cursor-pointer p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <input
                          type="checkbox"
                          checked={formik.values.subjectsAccess?.includes(
                            subject?._id?.toString()
                          )}
                          onChange={() =>
                            handleSubjectChange(subject?._id?.toString())
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-900">
                          {subject?.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Sources */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Source Access
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {sourceOptions.map((source) => (
                    <label
                      key={source}
                      className="flex items-center space-x-2 cursor-pointer p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <input
                        type="checkbox"
                        checked={formik.values.sourceAccess.includes(source)}
                        onChange={() => handleSourceChange(source)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900">{source}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Password */}
              {!isEditMode && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Security
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <div className="flex space-x-3">
                        <div className="relative flex-1">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            autocomplete="new-password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                            placeholder="Enter password or generate"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 transition-colors duration-200"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={generatePassword}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 font-medium transition-all duration-200"
                        >
                          <RefreshCw size={16} />
                          <span>Generate</span>
                        </button>
                      </div>
                      {formik.touched.password && formik.errors.password && (
                        <p className="mt-1 text-sm text-red-600">
                          {formik.errors.password}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md flex items-center space-x-2 font-medium transition-all duration-200"
                >
                  <Save size={20} />
                  <span>
                    {loading ? "Saving..." : isEditMode ? "Update" : "Create"}{" "}
                    User
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
