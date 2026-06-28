/**
 * SurfaceQ — OWASP Top 10 (2021) Mappings Module
 * Maps security findings to OWASP categories for compliance reporting.
 * @module owasp-mappings
 */

/**
 * OWASP Top 10 2021 — Full Reference
 */
export const OWASP_TOP_10 = [
  {
    id: 'A01',
    name: 'Broken Access Control',
    description:
      'Access control enforces policy such that users cannot act outside their intended permissions. Failures typically lead to unauthorized information disclosure, modification, or destruction of data, or performing a business function outside the user\'s limits.',
    severity: 'critical',
    cweIds: [200, 201, 352, 639, 862, 863, 913],
    references: [
      'https://owasp.org/Top10/A01_2021-Broken_Access_Control/',
      'https://cwe.mitre.org/data/definitions/284.html',
    ],
    mitigations: [
      'Implement proper access control mechanisms and enforce them server-side',
      'Deny access by default, except for public resources',
      'Use CORS to limit cross-origin resource sharing',
      'Disable web server directory listing',
      'Log access control failures and alert administrators',
      'Rate-limit API and controller access to minimize automated attack damage',
      'Invalidate session identifiers on the server after logout',
    ],
  },
  {
    id: 'A02',
    name: 'Cryptographic Failures',
    description:
      'Failures related to cryptography which often lead to sensitive data exposure. This includes using weak algorithms, insufficient key generation, not enforcing encryption in transit, or storing sensitive data in clear text.',
    severity: 'critical',
    cweIds: [259, 261, 296, 310, 319, 321, 327, 328, 329, 330, 331],
    references: [
      'https://owasp.org/Top10/A02_2021-Cryptographic_Failures/',
      'https://cwe.mitre.org/data/definitions/310.html',
    ],
    mitigations: [
      'Classify data processed, stored, or transmitted by the application',
      'Encrypt all sensitive data at rest and in transit',
      'Use strong standard algorithms, protocols, and keys',
      'Enforce HTTPS with HTTP Strict Transport Security (HSTS)',
      'Disable caching for responses containing sensitive data',
      'Do not use legacy protocols such as FTP and SMTP for transporting sensitive data',
      'Store passwords using strong adaptive salted hashing functions',
    ],
  },
  {
    id: 'A03',
    name: 'Injection',
    description:
      'Injection flaws occur when untrusted data is sent to an interpreter as part of a command or query. Common injection types include SQL, NoSQL, OS command, ORM, LDAP, and Expression Language or OGNL injection. Cross-site scripting (XSS) is also part of this category.',
    severity: 'critical',
    cweIds: [20, 74, 75, 77, 78, 79, 80, 89, 90, 917],
    references: [
      'https://owasp.org/Top10/A03_2021-Injection/',
      'https://cwe.mitre.org/data/definitions/74.html',
    ],
    mitigations: [
      'Use parameterized queries or prepared statements',
      'Use positive server-side input validation',
      'Escape special characters for any residual dynamic queries',
      'Use LIMIT and other SQL controls within queries to prevent mass disclosure',
      'Implement Content Security Policy (CSP) to mitigate XSS',
      'Use automated static analysis tools (SAST) in the CI/CD pipeline',
    ],
  },
  {
    id: 'A04',
    name: 'Insecure Design',
    description:
      'Insecure design represents weaknesses expressed as missing or ineffective control design. It is a broad category representing different weaknesses. Insecure design is not the source for all other risk categories; there is a difference between insecure design and insecure implementation.',
    severity: 'high',
    cweIds: [73, 183, 209, 256, 501, 522],
    references: [
      'https://owasp.org/Top10/A04_2021-Insecure_Design/',
      'https://cwe.mitre.org/data/definitions/284.html',
    ],
    mitigations: [
      'Establish and use a secure development lifecycle with AppSec professionals',
      'Use threat modeling for critical authentication, access control, and business logic flows',
      'Integrate security language and controls into user stories',
      'Write unit and integration tests to validate critical flows are resistant to the threat model',
      'Segregate tier layers on the system and network layers',
      'Limit resource consumption by user or service',
    ],
  },
  {
    id: 'A05',
    name: 'Security Misconfiguration',
    description:
      'The application might be vulnerable if it is missing appropriate security hardening, has improperly configured permissions, has unnecessary features enabled, uses default accounts or passwords, or exposes overly informative error messages.',
    severity: 'high',
    cweIds: [2, 11, 13, 15, 16, 260, 315, 520, 526, 537, 541, 547],
    references: [
      'https://owasp.org/Top10/A05_2021-Security_Misconfiguration/',
      'https://cwe.mitre.org/data/definitions/16.html',
    ],
    mitigations: [
      'Implement a repeatable hardening process for rapid deployment of locked-down environments',
      'Remove or do not install unused features and frameworks',
      'Review and update configurations as part of the patch management process',
      'Use a segmented application architecture for separation between components',
      'Send security directives to clients via security headers',
      'Implement an automated process to verify configuration effectiveness in all environments',
    ],
  },
  {
    id: 'A06',
    name: 'Vulnerable and Outdated Components',
    description:
      'Components such as libraries, frameworks, and other software modules run with the same privileges as the application. If a vulnerable component is exploited, it can facilitate serious data loss or server takeover.',
    severity: 'high',
    cweIds: [1035, 1104],
    references: [
      'https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/',
      'https://cwe.mitre.org/data/definitions/1035.html',
    ],
    mitigations: [
      'Remove unused dependencies, unnecessary features, components, and files',
      'Continuously inventory versions of client-side and server-side components and dependencies',
      'Only obtain components from official sources over secure links',
      'Monitor for unmaintained libraries and components that do not receive security patches',
      'Use software composition analysis (SCA) tools to automate detection',
      'Subscribe to email alerts for security vulnerabilities in used components',
    ],
  },
  {
    id: 'A07',
    name: 'Identification and Authentication Failures',
    description:
      'Confirmation of the user\'s identity, authentication, and session management is critical to protect against authentication-related attacks. Weaknesses include allowing brute force, default credentials, weak password recovery, and improper session management.',
    severity: 'high',
    cweIds: [255, 259, 287, 288, 290, 294, 295, 297, 300, 302, 304, 306, 307, 346, 384],
    references: [
      'https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/',
      'https://cwe.mitre.org/data/definitions/287.html',
    ],
    mitigations: [
      'Implement multi-factor authentication to prevent credential stuffing and brute force',
      'Do not deploy with any default credentials',
      'Implement weak password checks against common password lists',
      'Ensure registration, credential recovery, and API pathways are hardened',
      'Limit or increasingly delay failed login attempts with anti-automation',
      'Use a server-side, secure session manager that generates random session IDs',
    ],
  },
  {
    id: 'A08',
    name: 'Software and Data Integrity Failures',
    description:
      'Software and data integrity failures relate to code and infrastructure that does not protect against integrity violations. This includes using software from untrusted sources, insecure CI/CD pipelines, and auto-update functionality without integrity verification.',
    severity: 'high',
    cweIds: [345, 353, 426, 494, 502, 565, 784, 829, 830, 915],
    references: [
      'https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/',
      'https://cwe.mitre.org/data/definitions/345.html',
    ],
    mitigations: [
      'Use digital signatures to verify software or data is from the expected source',
      'Ensure libraries and dependencies are consuming trusted repositories',
      'Use a software supply chain security tool to verify components',
      'Implement Subresource Integrity (SRI) for third-party scripts',
      'Ensure there is a review process for code and configuration changes',
      'Ensure the CI/CD pipeline has proper segregation, configuration, and access control',
    ],
  },
  {
    id: 'A09',
    name: 'Security Logging and Monitoring Failures',
    description:
      'Without logging and monitoring, breaches cannot be detected. Insufficient logging, detection, monitoring, and active response occurs when auditable events are not logged, warnings and errors generate no or inadequate log messages, or logs are only stored locally.',
    severity: 'high',
    cweIds: [117, 223, 532, 778],
    references: [
      'https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/',
      'https://cwe.mitre.org/data/definitions/778.html',
    ],
    mitigations: [
      'Ensure all login, access control, and server-side input validation failures are logged',
      'Ensure logs are generated in a format that log management solutions can consume',
      'Ensure log data is encoded correctly to prevent injection attacks on logging systems',
      'Ensure high-value transactions have an audit trail with integrity controls',
      'Establish effective monitoring and alerting to detect suspicious activity',
      'Adopt an incident response and recovery plan',
    ],
  },
  {
    id: 'A10',
    name: 'Server-Side Request Forgery (SSRF)',
    description:
      'SSRF flaws occur when a web application fetches a remote resource without validating the user-supplied URL. It allows an attacker to coerce the application to send a crafted request to an unexpected destination, even when protected by a firewall or VPN.',
    severity: 'high',
    cweIds: [918],
    references: [
      'https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/',
      'https://cwe.mitre.org/data/definitions/918.html',
    ],
    mitigations: [
      'Sanitize and validate all client-supplied input data',
      'Enforce the URL schema, port, and destination with a positive allow list',
      'Do not send raw responses to clients',
      'Disable HTTP redirections',
      'Use network segmentation to limit SSRF impact',
      'For residual SSRF, do not mitigate via deny lists or regular expressions',
    ],
  },
];

/**
 * Mapping from SurfaceQ finding types to OWASP category IDs.
 */
export const FINDING_TO_OWASP_MAP = {
  'missing-csp': ['A05'],
  'weak-csp': ['A05'],
  'missing-hsts': ['A02', 'A05'],
  'weak-hsts': ['A02', 'A05'],
  'missing-x-frame-options': ['A01', 'A05'],
  'missing-x-content-type-options': ['A05'],
  'missing-referrer-policy': ['A05'],
  'missing-permissions-policy': ['A05'],
  'deprecated-header': ['A05'],
  'mixed-content': ['A02'],
  'exposed-source-maps': ['A05'],
  'form-no-csrf': ['A01'],
  'form-no-https': ['A02'],
  'form-autocomplete-password': ['A07'],
  'excessive-third-party': ['A08'],
  'subresource-integrity': ['A08'],
  'cookie-no-secure': ['A02'],
  'cookie-no-httponly': ['A03'],
  'cookie-no-samesite': ['A01'],
  'information-disclosure': ['A01'],
  'server-version-exposed': ['A05'],
  'directory-listing': ['A01'],
  'default-credentials': ['A07'],
  'open-redirect': ['A01'],
  'cors-misconfiguration': ['A01', 'A05'],
  'outdated-library': ['A06'],
  'missing-sri': ['A08'],
  'insecure-form-action': ['A02'],
  'sensitive-data-exposure': ['A02'],
  'xss-reflection': ['A03'],
  'sql-injection': ['A03'],
  'missing-logging': ['A09'],
  'ssrf': ['A10'],
};

/**
 * Map a finding type to its OWASP Top 10 entries.
 * @param {string} findingType - e.g. 'missing-csp'
 * @returns {Array} Array of matching OWASP_TOP_10 entry objects
 */
export function mapFindingToOWASP(findingType) {
  const owaspIds = FINDING_TO_OWASP_MAP[findingType];
  if (!owaspIds || owaspIds.length === 0) {
    return [];
  }

  return owaspIds
    .map((id) => OWASP_TOP_10.find((entry) => entry.id === id))
    .filter(Boolean);
}

/**
 * Get full OWASP entry by category ID.
 * @param {string} id - e.g. 'A01'
 * @returns {object|null}
 */
export function getOWASPDetails(id) {
  if (!id) return null;
  const normalized = id.toUpperCase();
  return OWASP_TOP_10.find((entry) => entry.id === normalized) || null;
}

/**
 * Get CWE references for a given OWASP category.
 * @param {string} id - e.g. 'A03'
 * @returns {Array<{cweId: number, url: string}>}
 */
export function getOWASPReferences(id) {
  const entry = getOWASPDetails(id);
  if (!entry) return [];

  return entry.cweIds.map((cweId) => ({
    cweId,
    url: `https://cwe.mitre.org/data/definitions/${cweId}.html`,
  }));
}

/**
 * Get the severity level for an OWASP category.
 * @param {string} id - e.g. 'A01'
 * @returns {string|null}
 */
export function getOWASPSeverity(id) {
  const entry = getOWASPDetails(id);
  return entry ? entry.severity : null;
}

/**
 * Given a finding object with a 'type' property, return all
 * matching OWASP mappings with full details.
 * @param {object} finding - Must have a 'type' string property
 * @returns {Array<{owaspId: string, owaspName: string, owaspDescription: string, severity: string, cweIds: number[], references: string[], mitigations: string[]}>}
 */
export function getAllMappingsForFinding(finding) {
  if (!finding || !finding.type) return [];

  const entries = mapFindingToOWASP(finding.type);

  return entries.map((entry) => ({
    owaspId: entry.id,
    owaspName: entry.name,
    owaspDescription: entry.description,
    severity: entry.severity,
    cweIds: entry.cweIds,
    references: entry.references,
    mitigations: entry.mitigations,
  }));
}
