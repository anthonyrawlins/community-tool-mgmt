# Version Management

## Version Correlation Requirements

All version numbers MUST be kept synchronized across:
- **API Version**: Backend API version (currently `v1` in `/api/v1/` endpoints)
- **Git Tags**: Repository releases (e.g., `alpha-1`, `beta-1`, `v1.0.0`)
- **Docker Images**: Container tags on Docker Hub (e.g., `:alpha-1`, `:v1.0.0`)
- **Application Version**: Frontend/backend package.json versions

## Current Version Status

- **API**: v1 (stable alpha)
- **Release**: alpha-1
- **Docker Tags**: alpha-1
- **Git Tag**: alpha-1

## TODOs for Version Management

- [ ] **Implement Automatic Version Numbering Tooling**
  - Create version management script/tool that automatically updates:
    - `package.json` versions in frontend and backend
    - API version constants in backend code
    - Docker image tags during build process
    - Git tags during release process
  - Consider semantic versioning (semver) compliance
  - Integrate with CI/CD pipeline for automated releases
  - Add version bump commands (patch, minor, major)
  - Ensure version consistency checks before deployment

## Version History

### alpha-1 (Current)
- **Released**: 2025-06-20
- **Status**: Alpha release with full frontend/backend connectivity
- **Git Tag**: alpha-1
- **Docker Images**: 
  - `anthonyrawlins/ballarat-tools-backend:alpha-1`
  - `anthonyrawlins/ballarat-tools-frontend:alpha-1`
- **API Version**: v1
- **Deployment**: https://tools.home.deepblack.cloud/

## Future Versioning Strategy

Moving forward, all releases will follow semantic versioning:
- **Major** (e.g., v2.0.0): Breaking API changes, major feature releases
- **Minor** (e.g., v1.1.0): New features, API additions (backward compatible)
- **Patch** (e.g., v1.0.1): Bug fixes, security updates (backward compatible)

The next planned releases:
- **beta-1**: Feature-complete beta with user testing
- **v1.0.0**: Production-ready stable release