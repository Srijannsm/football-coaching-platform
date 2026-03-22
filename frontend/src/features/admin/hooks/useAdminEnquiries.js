import { useCallback, useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "../../../utils/getErrorMessage";
import {
  getAdminEnquiries,
  getAdminEnquiryDetail,
  updateAdminEnquiry,
} from "../services/adminManagementService";

export function useAdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState(null);

  const [isListLoading, setIsListLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [listError, setListError] = useState("");
  const [detailError, setDetailError] = useState("");

  const fetchEnquiries = useCallback(async () => {
    try {
      setIsListLoading(true);
      setListError("");

      const response = await getAdminEnquiries();
      const enquiryRows = Array.isArray(response) ? response : response?.results || [];

      setEnquiries(enquiryRows);

      if (enquiryRows.length === 0) {
        setSelectedEnquiryId(null);
        setSelectedEnquiry(null);
      } else {
        setSelectedEnquiryId((currentId) => {
          const exists = enquiryRows.some((enquiry) => enquiry.id === currentId);
          return exists ? currentId : enquiryRows[0].id;
        });
      }
    } catch (error) {
      setListError(getErrorMessage(error, "Failed to load enquiries."));
    } finally {
      setIsListLoading(false);
    }
  }, []);

  const fetchEnquiryDetail = useCallback(async (enquiryId) => {
    if (!enquiryId) {
      setSelectedEnquiry(null);
      setDetailError("");
      return;
    }

    try {
      setIsDetailLoading(true);
      setDetailError("");

      const response = await getAdminEnquiryDetail(enquiryId);
      setSelectedEnquiry(response);
    } catch (error) {
      setDetailError(getErrorMessage(error, "Failed to load enquiry details."));
      setSelectedEnquiry(null);
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const saveEnquiry = useCallback(async ({ enquiryId, status, admin_notes }) => {
    try {
      setIsSaving(true);
      setDetailError("");

      const updated = await updateAdminEnquiry(enquiryId, { status, admin_notes });

      setEnquiries((prev) =>
        prev.map((enquiry) =>
          enquiry.id === enquiryId ? { ...enquiry, status: updated.status } : enquiry
        )
      );

      setSelectedEnquiry((prev) =>
        prev?.id === enquiryId
          ? {
              ...prev,
              status: updated.status,
              admin_notes: updated.admin_notes,
            }
          : prev
      );

      return updated;
    } catch (error) {
      const message = getErrorMessage(error, "Failed to save enquiry.");
      setDetailError(message);
      throw new Error(message);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const filteredEnquiries = useMemo(() => enquiries, [enquiries]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  useEffect(() => {
    fetchEnquiryDetail(selectedEnquiryId);
  }, [fetchEnquiryDetail, selectedEnquiryId]);

  return {
    enquiries: filteredEnquiries,
    selectedEnquiry,
    selectedEnquiryId,
    setSelectedEnquiryId,
    isListLoading,
    isDetailLoading,
    isSaving,
    listError,
    detailError,
    refetchList: fetchEnquiries,
    saveEnquiry,
  };
}
