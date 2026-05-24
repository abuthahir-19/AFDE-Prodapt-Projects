from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.models.category import Category
from app.models.tag import Tag
from app.models.article import Article
from app.models.approval import ApprovalHistory
from app.models.rating import Rating
from app.models.comment import Comment
from app.models.bookmark import Bookmark


# ── Helpers ────────────────────────────────────────────────────────────────────

def _user(db, name, email, role, department):
    u = db.query(User).filter_by(email=email).first()
    if not u:
        u = User(
            name=name, email=email,
            hashed_password=hash_password("Password@123"),
            role=role, department=department, is_active=True,
        )
        db.add(u)
        db.flush()
    return u


def _category(db, name, admin_id):
    c = db.query(Category).filter_by(name=name).first()
    if not c:
        c = Category(name=name, created_by=admin_id)
        db.add(c)
        db.flush()
    return c


def _tag(db, name):
    t = db.query(Tag).filter_by(name=name).first()
    if not t:
        t = Tag(name=name)
        db.add(t)
        db.flush()
    return t


def _article(db, title, description, content, status, author, category, tags,
             view_count=0, rejection_reason=None, days_ago=0):
    created = datetime.utcnow() - timedelta(days=days_ago)
    a = Article(
        title=title,
        description=description,
        content=content,
        status=status,
        author_id=author.id,
        category_id=category.id if category else None,
        view_count=view_count,
        rejection_reason=rejection_reason,
        created_at=created,
        updated_at=created,
    )
    a.tags = tags
    db.add(a)
    db.flush()
    return a


# ── Main seed function ─────────────────────────────────────────────────────────

def seed_demo_data(db: Session) -> None:
    if db.query(Article).first():
        return  # already seeded

    admin = db.query(User).filter_by(email="admin@company.com").first()
    if not admin:
        return

    # ── Users ──────────────────────────────────────────────────────────────────
    alice   = _user(db, "Alice Johnson",  "alice.johnson@company.com",  "author",   "Engineering")
    bob     = _user(db, "Bob Smith",      "bob.smith@company.com",      "author",   "HR")
    carol   = _user(db, "Carol Williams", "carol.williams@company.com", "author",   "IT Infrastructure")
    david   = _user(db, "David Brown",    "david.brown@company.com",    "reviewer", "Security")
    emma    = _user(db, "Emma Davis",     "emma.davis@company.com",     "reviewer", "Finance")
    frank   = _user(db, "Frank Wilson",   "frank.wilson@company.com",   "employee", "Product")
    grace   = _user(db, "Grace Lee",      "grace.lee@company.com",      "employee", "Legal")
    henry   = _user(db, "Henry Taylor",   "henry.taylor@company.com",   "author",   "Engineering")

    # ── Categories ─────────────────────────────────────────────────────────────
    cat_it  = _category(db, "IT Infrastructure", admin.id)
    cat_hr  = _category(db, "HR Policies",       admin.id)
    cat_fin = _category(db, "Finance",           admin.id)
    cat_sec = _category(db, "Security",          admin.id)
    cat_onb = _category(db, "Onboarding",        admin.id)
    cat_pro = _category(db, "Product",           admin.id)
    cat_eng = _category(db, "Engineering",       admin.id)
    cat_leg = _category(db, "Legal",             admin.id)

    # ── Tags ───────────────────────────────────────────────────────────────────
    t_py   = _tag(db, "python")
    t_api  = _tag(db, "api")
    t_sec  = _tag(db, "security")
    t_net  = _tag(db, "network")
    t_hr   = _tag(db, "hr")
    t_pol  = _tag(db, "policy")
    t_fin  = _tag(db, "finance")
    t_dev  = _tag(db, "devops")
    t_onb  = _tag(db, "onboarding")
    t_k8s  = _tag(db, "kubernetes")
    t_doc  = _tag(db, "docker")
    t_cmp  = _tag(db, "compliance")
    t_dat  = _tag(db, "data")
    t_cld  = _tag(db, "cloud")
    t_agl  = _tag(db, "agile")
    t_dcs  = _tag(db, "documentation")

    # ── Published Articles (15) ────────────────────────────────────────────────
    pub = []

    pub.append(_article(db,
        "VPN Setup Guide for Remote Workers",
        "Complete instructions for configuring the corporate VPN on Windows and macOS.",
        "Install the GlobalProtect VPN client from the IT portal. On Windows run the installer and follow the prompts. "
        "On macOS drag the app to Applications. Launch GlobalProtect and enter portal address vpn.company.com. "
        "Use your corporate email and password. For MFA approve the push notification on your mobile device.",
        "published", carol, cat_it, [t_net, t_sec], view_count=1842, days_ago=60))

    pub.append(_article(db,
        "How to Reset Your Active Directory Password",
        "Step-by-step guide for resetting your AD password without IT assistance.",
        "To reset your Active Directory password: 1) Press Ctrl+Alt+Delete and select Change a Password. "
        "2) Enter your current password. 3) Enter your new password twice. "
        "Passwords must be at least 12 characters and include uppercase letters, numbers and symbols.",
        "published", carol, cat_it, [t_sec, t_net], view_count=2541, days_ago=55))

    pub.append(_article(db,
        "Annual Performance Review Process",
        "Guide to preparing for and completing the annual performance review cycle.",
        "Performance reviews occur in Q4 each year. Employees complete a self-assessment in Workday by November 1st. "
        "Managers conduct 1:1 meetings to discuss goals and achievements. Ratings range from 1-5 where 3 is meets expectations. "
        "Reviews are finalised by December 15th. Compensation adjustments take effect January 1st.",
        "published", bob, cat_hr, [t_hr, t_pol], view_count=1532, days_ago=50))

    pub.append(_article(db,
        "Company Expense Reimbursement Policy",
        "Official policy for submitting and approving business expense claims.",
        "All business expenses must be submitted within 30 days of incurrence via the Concur expense system. "
        "Receipts are required for amounts over $25. Meal expenses are capped at $75 per person per day. "
        "Travel requires pre-approval for trips over $500. Finance processes reimbursements within 10 business days.",
        "published", bob, cat_hr, [t_hr, t_fin, t_pol], view_count=876, days_ago=48))

    pub.append(_article(db,
        "Git Branching Strategy and Workflow",
        "Engineering team guidelines for managing code branches and pull requests.",
        "We use trunk-based development with short-lived feature branches. "
        "Branch names follow the pattern feature/TICKET-description or bugfix/TICKET-description. "
        "All changes require a pull request with at least one reviewer approval. "
        "PRs must pass CI checks before merging. Main branch is always deployable.",
        "published", alice, cat_eng, [t_dev, t_agl], view_count=1876, days_ago=45))

    pub.append(_article(db,
        "Docker and Container Best Practices",
        "Guidelines for building and running containerised applications.",
        "Use official base images and pin to specific versions. Keep images small using multi-stage builds. "
        "Never run containers as root. Store secrets in environment variables or a secrets manager not in images. "
        "Health checks should be defined for all production containers. Tag images with the git commit SHA.",
        "published", alice, cat_eng, [t_doc, t_dev], view_count=1298, days_ago=40))

    pub.append(_article(db,
        "Onboarding Checklist for New Hires",
        "Everything a new employee needs to complete in their first 30 days.",
        "Week 1: Complete I-9 and tax forms in Workday. Attend new hire orientation on Day 1. "
        "Set up your laptop using the IT setup guide. Get your access badge from reception. "
        "Week 2: Complete mandatory compliance training in LMS. Meet with your manager to align on 30-60-90 day goals.",
        "published", bob, cat_onb, [t_onb, t_hr], view_count=2341, days_ago=38))

    pub.append(_article(db,
        "Information Security Awareness Training",
        "Required annual training covering phishing, social engineering and data protection.",
        "This training must be completed annually by all employees. Topics covered include phishing email identification, "
        "social engineering tactics, password hygiene, data classification and incident reporting. "
        "Training takes approximately 2 hours and is available in the LMS.",
        "published", david, cat_sec, [t_sec, t_cmp], view_count=987, days_ago=35))

    pub.append(_article(db,
        "Kubernetes Cluster Management Guide",
        "Operational guide for managing production Kubernetes clusters.",
        "Use kubectl with the approved kubeconfig context for your environment. "
        "Never run kubectl delete on production without a change request. "
        "Monitor cluster health via the Grafana dashboard at grafana.internal. "
        "Node autoscaling is enabled with min 3 max 20 nodes per availability zone.",
        "published", henry, cat_eng, [t_k8s, t_dev, t_cld], view_count=876, days_ago=32))

    pub.append(_article(db,
        "Finance Month-End Close Process",
        "Steps the finance team follows to close the books each month.",
        "The month-end close follows a 5-day schedule. Day 1: Record all journal entries and accruals. "
        "Day 2: Reconcile all balance sheet accounts. Day 3: Review P&L for anomalies and obtain department sign-offs. "
        "Day 4: Consolidate subsidiaries and intercompany eliminations. Day 5: Finalise trial balance.",
        "published", emma, cat_fin, [t_fin], view_count=543, days_ago=30))

    pub.append(_article(db,
        "Data Classification and Handling Policy",
        "How to classify and protect company and customer data assets.",
        "Data is classified into four levels: Public, Internal, Confidential, and Restricted. "
        "All employee laptops must use full-disk encryption. Customer data must never be stored on personal devices. "
        "Sharing confidential data externally requires DLP approval.",
        "published", david, cat_sec, [t_sec, t_dat, t_pol], view_count=1122, days_ago=28))

    pub.append(_article(db,
        "CI/CD Pipeline Overview",
        "How the continuous integration and deployment pipeline works.",
        "Code pushed to a feature branch triggers unit tests and linting. "
        "Merging to main triggers the full pipeline including integration tests, security scans and build. "
        "Deployment to staging is automatic on main merge. Production deployments require a manual approval gate.",
        "published", henry, cat_eng, [t_dev, t_agl], view_count=1654, days_ago=25))

    pub.append(_article(db,
        "Cloud Cost Optimisation Guide",
        "Strategies for managing and reducing cloud infrastructure costs.",
        "Review the monthly AWS Cost Explorer report shared by FinOps. "
        "Rightsize EC2 instances using the Compute Optimizer recommendations. "
        "Delete unattached EBS volumes and unused Elastic IPs monthly. "
        "Use Reserved Instances for stable workloads to save up to 40%.",
        "published", carol, cat_it, [t_cld, t_fin, t_dev], view_count=987, days_ago=20))

    pub.append(_article(db,
        "API Documentation Standards",
        "Engineering standards for writing and maintaining API documentation.",
        "All public APIs must have OpenAPI 3.0 compliant documentation. "
        "Document every endpoint with description, parameters, request body and response schemas. "
        "Include example requests and responses. Mark deprecated endpoints with a deprecation date.",
        "published", alice, cat_eng, [t_api, t_dcs], view_count=934, days_ago=18))

    pub.append(_article(db,
        "Employee Benefits Enrolment Guide",
        "How to enrol in or change health, dental and vision benefits.",
        "Open enrolment occurs each November for the following calendar year. "
        "Log in to BenefitsFocus at benefits.company.com. Review your current coverage and make changes. "
        "Qualifying life events such as marriage or new dependents allow changes outside open enrolment.",
        "published", bob, cat_hr, [t_hr, t_pol], view_count=2034, days_ago=15))

    # ── Approval history for published articles ────────────────────────────────
    reviewers = [david, emma]
    for i, a in enumerate(pub):
        reviewer = reviewers[i % 2]
        db.add(ApprovalHistory(
            article_id=a.id,
            reviewer_id=reviewer.id,
            action="approved",
            comments="Looks good. Approved for publication.",
            created_at=a.created_at + timedelta(days=2),
        ))

    # ── Pending approval articles (4) ─────────────────────────────────────────
    pending = []
    pending.append(_article(db,
        "Secure Coding Practices for Python",
        "Developer guidelines for writing secure Python code.",
        "Validate all input on the server side — never trust client data. "
        "Use parameterised queries to prevent SQL injection. Encode output to prevent XSS. "
        "Store passwords using bcrypt with cost factor 12 or higher.",
        "pending_approval", alice, cat_sec, [t_py, t_sec, t_api], view_count=0, days_ago=5))

    pending.append(_article(db,
        "Leave and Absence Policy 2025",
        "Comprehensive guide to vacation, sick leave and other time-off policies.",
        "Employees accrue 1.25 vacation days per month up to a maximum of 20 days. "
        "Sick leave is granted at 10 days per year and does not carry over. "
        "Parental leave provides 12 weeks fully paid for primary caregivers.",
        "pending_approval", bob, cat_hr, [t_hr, t_pol], view_count=0, days_ago=4))

    pending.append(_article(db,
        "Terraform Module Development Guide",
        "How to write and publish reusable Terraform modules for the internal registry.",
        "Modules must have a README, inputs, outputs and examples directory. "
        "Use semantic versioning for module releases. Inputs must have type constraints and descriptions. "
        "Test modules using Terratest.",
        "pending_approval", henry, cat_eng, [t_dev, t_cld], view_count=0, days_ago=3))

    pending.append(_article(db,
        "Vendor Management Policy",
        "How to onboard, evaluate and manage third-party vendors.",
        "New vendors must complete the vendor onboarding form and provide business insurance and SOC 2 report. "
        "Vendors handling company data must sign a DPA. Annual vendor reviews evaluate performance and SLA compliance.",
        "pending_approval", carol, cat_leg, [t_pol, t_cmp], view_count=0, days_ago=2))

    # ── Draft articles (3) ────────────────────────────────────────────────────
    _article(db,
        "Microservices Design Principles (Draft)",
        "Guidelines for designing and building microservices at the company.",
        "Each service owns its data and has a single responsibility. "
        "Services communicate via REST or gRPC. Use async messaging via Kafka for event-driven patterns.",
        "draft", alice, cat_eng, [t_api, t_dev], view_count=0, days_ago=7)

    _article(db,
        "Accounts Payable Process (Draft)",
        "How to submit and approve vendor invoices for payment.",
        "Submit vendor invoices to ap@company.com with the PO number in the subject line. "
        "Invoices without a valid PO will be returned. Three-way matching: invoice must match PO and goods receipt.",
        "draft", emma, cat_fin, [t_fin], view_count=0, days_ago=6)

    _article(db,
        "New Employee IT Setup Guide (Draft)",
        "Detailed IT setup steps for your first week at the company.",
        "Day 1 Morning: Collect your laptop from IT on floor 3. Sign the equipment form. "
        "Day 1 Afternoon: Run the company setup script from the IT portal.",
        "draft", carol, cat_onb, [t_onb], view_count=0, days_ago=3)

    # ── Rejected articles (2) ─────────────────────────────────────────────────
    rej1 = _article(db,
        "Personal Device Usage Policy",
        "Draft policy for using personal devices for work.",
        "Employees may use personal devices to access corporate email via the Outlook app. "
        "Personal devices must be enrolled in MDM. Corporate data must not be stored in personal cloud storage.",
        "rejected", frank, cat_sec, [t_sec, t_pol], view_count=0, days_ago=14)
    db.add(ApprovalHistory(
        article_id=rej1.id, reviewer_id=david.id, action="rejected",
        comments="Policy conflicts with the existing AUP. Please align with the IT security standards before resubmitting.",
        created_at=rej1.created_at + timedelta(days=1),
    ))
    rej1.rejection_reason = "Conflicts with existing Acceptable Use Policy. Needs revision."

    rej2 = _article(db,
        "Freelancer Contractor Onboarding",
        "Steps for onboarding external contractors and freelancers.",
        "Contractors must sign an NDA and IP assignment agreement before starting. "
        "IT provisions temporary accounts with 90-day expiry. Access is restricted to project-specific systems.",
        "rejected", grace, cat_onb, [t_onb, t_pol], view_count=0, days_ago=10)
    db.add(ApprovalHistory(
        article_id=rej2.id, reviewer_id=emma.id, action="rejected",
        comments="Needs Legal review before publication. Missing GDPR data handling section.",
        created_at=rej2.created_at + timedelta(days=1),
    ))
    rej2.rejection_reason = "Requires Legal sign-off and GDPR section."

    # ── Archived article (1) ──────────────────────────────────────────────────
    _article(db,
        "Legacy VPN Setup (Cisco AnyConnect)",
        "Deprecated setup guide for the old Cisco AnyConnect VPN client.",
        "This guide covers the legacy Cisco AnyConnect VPN client which has been replaced by GlobalProtect. "
        "Please refer to the current VPN Setup Guide for remote workers. This article is retained for historical reference.",
        "archived", carol, cat_it, [t_net], view_count=312, days_ago=180)

    db.flush()

    # ── Ratings (for published articles) ──────────────────────────────────────
    raters = [frank, grace, david, emma, alice]
    rated_pairs = set()
    rating_values = [4, 5, 3, 5, 4, 4, 5, 3, 4, 5, 4, 3, 5, 4, 4]

    for i, article in enumerate(pub):
        for j, rater in enumerate(raters[:3]):
            if (rater.id, article.id) not in rated_pairs:
                db.add(Rating(
                    value=rating_values[(i + j) % len(rating_values)],
                    user_id=rater.id,
                    article_id=article.id,
                ))
                rated_pairs.add((rater.id, article.id))

    # ── Comments (for published articles) ─────────────────────────────────────
    comment_texts = [
        "Very helpful article, exactly what I needed!",
        "Thanks for this. Could you add more details about the edge cases?",
        "We followed this guide last week and it worked perfectly.",
        "Is this still up to date? I noticed a few things have changed recently.",
        "Great write-up. Adding this to my bookmarks.",
        "This saved me a lot of time — appreciate the clear instructions.",
    ]
    commenters = [frank, grace, alice, bob, henry]

    for i, article in enumerate(pub[:10]):
        commenter = commenters[i % len(commenters)]
        db.add(Comment(
            content=comment_texts[i % len(comment_texts)],
            user_id=commenter.id,
            article_id=article.id,
        ))

    # ── Bookmarks ─────────────────────────────────────────────────────────────
    bookmarked_pairs = set()
    bookmarkers = [frank, grace, alice, bob]

    for i, article in enumerate(pub[:8]):
        bookmarker = bookmarkers[i % len(bookmarkers)]
        if (bookmarker.id, article.id) not in bookmarked_pairs:
            db.add(Bookmark(user_id=bookmarker.id, article_id=article.id))
            bookmarked_pairs.add((bookmarker.id, article.id))

    db.commit()
    print("[startup] Demo data seeded: 8 users, 8 categories, 16 tags, 25 articles")
