# Secrets Configuration

This directory contains sensitive configuration files for the Docker Swarm deployment.

## Important Security Notes

⚠️ **NEVER commit these files to version control!**
⚠️ **Update all default passwords before production deployment!**

## Files in this directory:

- `db_password.txt` - PostgreSQL database password
- `redis_password.txt` - Redis cache password  
- `jwt_secret.txt` - JWT signing secret (must be 256+ bits for production)
- `stripe_secret_key.txt` - Stripe API secret key
- `stripe_publishable_key.txt` - Stripe publishable key

## Before Deployment:

1. Replace all `CHANGEME_` prefixed values with secure, randomly generated secrets
2. Use different passwords for each service
3. For JWT secret, use a cryptographically secure random string of at least 32 characters
4. Set up real Stripe keys (test keys for staging, live keys for production)

## Generate Secure Passwords:

```bash
# Generate secure passwords
openssl rand -base64 32 > db_password.txt
openssl rand -base64 32 > redis_password.txt  
openssl rand -base64 64 > jwt_secret.txt
```

## Stripe Configuration:

- Get your Stripe keys from: https://dashboard.stripe.com/apikeys
- Test keys start with `sk_test_` and `pk_test_`
- Live keys start with `sk_live_` and `pk_live_`