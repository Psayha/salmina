/**
 * @file legal.ts
 * @description Legal documents and terms-related types
 * @author AI Assistant
 * @created 2024-11-13
 */

/**
 * Legal document type enumeration
 * Defines different types of legal documents
 */
export enum LegalDocumentType {
  /** Terms of service/usage */
  TERMS = 'TERMS',
  /** Privacy policy */
  PRIVACY = 'PRIVACY',
  /** Offer/Public offer */
  OFFER = 'OFFER',
  /** Delivery and payment information */
  DELIVERY_PAYMENT = 'DELIVERY_PAYMENT',
}

/**
 * Legal document entity type
 * Represents a legal document (terms, privacy policy, etc.)
 */
export interface LegalDocument {
  /** Unique document identifier (UUID) */
  id: string;
  /** Document type */
  type: LegalDocumentType;
  /** Document title */
  title: string;
  /** Document content (HTML or plain text) */
  content: string;
  /** Document version string */
  version: string;
  /** Is this the currently active version */
  isActive: boolean;
  /** When the document was published (optional) */
  publishedAt?: Date | null;
  /** Document creation timestamp */
  createdAt: Date;
  /** Document last update timestamp */
  updatedAt: Date;
}

/**
 * Legal document list item
 * Used in API responses for document listings
 */
export interface LegalDocumentListItem {
  /** Document identifier */
  id: string;
  /** Document type */
  type: LegalDocumentType;
  /** Document title */
  title: string;
  /** Document version */
  version: string;
  /** Is currently active */
  isActive: boolean;
  /** Published date */
  publishedAt?: Date | null;
}

/**
 * Create legal document DTO (Data Transfer Object)
 * Used for creating new legal documents (admin only)
 */
export interface CreateLegalDocumentDTO {
  /** Document type */
  type: LegalDocumentType;
  /** Document title */
  title: string;
  /** Document content */
  content: string;
  /** Document version */
  version: string;
  /** Publish immediately */
  publish?: boolean;
}

/**
 * Update legal document DTO (Data Transfer Object)
 * Used for updating existing legal documents (admin only)
 */
export interface UpdateLegalDocumentDTO {
  /** Document title (optional) */
  title?: string;
  /** Document content (optional) */
  content?: string;
  /** Is currently active (optional) */
  isActive?: boolean;
}

/**
 * Legal document with full history
 * Includes all versions of a document
 */
export interface LegalDocumentWithHistory extends LegalDocument {
  /** Previous versions of this document */
  previousVersions?: LegalDocument[];
}

/**
 * User legal document acceptance
 * Tracks which legal documents a user has accepted
 */
export interface UserLegalAcceptance {
  /** User identifier */
  userId: string;
  /** Document type */
  documentType: LegalDocumentType;
  /** Document version accepted */
  documentVersion: string;
  /** Acceptance timestamp */
  acceptedAt: Date;
}

/**
 * Legal documents bundle
 * Contains all active legal documents
 */
export interface LegalDocumentsBundle {
  /** Terms of service */
  terms?: LegalDocument;
  /** Privacy policy */
  privacy?: LegalDocument;
  /** Public offer */
  offer?: LegalDocument;
  /** Delivery and payment info */
  deliveryPayment?: LegalDocument;
}

/**
 * Publish legal document DTO (Data Transfer Object)
 * Used for publishing a document as active
 */
export interface PublishLegalDocumentDTO {
  /** Document ID to publish */
  documentId: string;
}

/**
 * Legal document acceptance check
 * Used to verify if user has accepted required documents
 */
export interface LegalDocumentAcceptanceCheck {
  /** User has accepted terms */
  termsAccepted: boolean;
  /** User has accepted privacy policy */
  privacyAccepted: boolean;
  /** Required documents that user must accept */
  requiredDocuments: LegalDocumentType[];
  /** Optional documents */
  optionalDocuments: LegalDocumentType[];
  /** Whether user meets all requirements */
  isCompliant: boolean;
}

/**
 * Legal document metadata
 * Additional information about a legal document
 */
export interface LegalDocumentMetadata {
  /** Document type */
  type: LegalDocumentType;
  /** Current active version */
  currentVersion: string;
  /** Previous versions available */
  availableVersions: string[];
  /** Last updated date */
  lastUpdated: Date;
  /** When document was first created */
  createdAt: Date;
  /** Whether document is currently published */
  isPublished: boolean;
}
