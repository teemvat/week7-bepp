const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Job = require("../models/jobModel");

const jobs = [
    {
        title: "Software Engineer",
        type: "Full-time",
        description: "Develop new features for Google products.",
        company: {
            name: "Google",
            contactEmail: "gmail@gmail.com",
            contactPhone: "123-456-7890",
        },
    },
    {
        title: "Product Manager",
        type: "Full-time",
        description: "Manage the product development process.",
        company: {
            name: "Facebook",
            contactEmail: "facebook@facebook.com",
            contactPhone: "123-456-7890",
        },
    },
];

describe("Job Controller", () => {
    beforeEach(async () => {
        await Job.deleteMany({});
        await Job.insertMany(jobs);
    });

    afterAll(() => {
        mongoose.connection.close();
    });

    // Test GET /api/jobs
    it("should return all jobs as JSON when GET /api/jobs is called", async () => {
        const response = await api
            .get("/api/jobs")
            .expect(200)
            .expect("Content-Type", /application\/json/);

        expect(response.body).toHaveLength(jobs.length);
    });

    // Test POST /api/jobs
    it("should create a new job when POST /api/jobs is called", async () => {
        const newJob = {
            title: "Data Scientist",
            type: "Full-time",
            description: "Analyze data to provide insights for business decisions.",
            company: {
                name: "Amazon",
                contactEmail: "amazon@amazon.com",
                contactPhone: "123-456-7890",
            },
        };

        await api
            .post("/api/jobs")
            .send(newJob)
            .expect(201)
            .expect("Content-Type", /application\/json/);

        const jobsAfterPost = await Job.find({});
        expect(jobsAfterPost).toHaveLength(jobs.length + 1);
        const jobTitles = jobsAfterPost.map((job) => job.title);
        expect(jobTitles).toContain(newJob.title);
    });

    // Test GET /api/jobs/:id
    it("should return a single job as JSON when GET /api/jobs/:id is called", async () => {
        const job = await Job.findOne();

        await api
            .get(`/api/jobs/${job.id}`)
            .expect(200)
            .expect("Content-Type", /application\/json/);
    });

    it("should return 404 for a non-existing job ID", async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        await api.get(`/api/jobs/${nonExistentId}`).expect(404);
      });

    // Test DELETE /api/jobs/:id
    it("should delete a job when DELETE /api/jobs/:id is called", async () => {
        const job = await Job.findOne();

        await api
            .delete(`/api/jobs/${job.id}`)
            .expect(204);

        const jobsAfterDelete = await Job.find({});
        expect(jobsAfterDelete).toHaveLength(jobs.length - 1);
        const jobTitles = jobsAfterDelete.map((job) => job.title);
        expect(jobTitles).not.toContain(job.title);
    });

    // Test PUT /api/jobs/:id
    it("should update a job when PUT /api/jobs/:id is called", async () => {
        const job = await Job.findOne();

        const updatedJob = {
            title: "Updated Title",
            type: "Updated Type",
            description: "Updated Description",
        };

        await api
            .put(`/api/jobs/${job.id}`)
            .send(updatedJob)
            .expect(200)
            .expect("Content-Type", /application\/json/);

        const updatedJobCheck = await Job.findById(job.id);
        expect(updatedJobCheck.title).toBe(updatedJob.title);
        expect(updatedJobCheck.type).toBe(updatedJob.type);
        expect(updatedJobCheck.description).toBe(updatedJob.description);
    });

    it("should return 400 for invalid job ID when PUT /api/jobs/:id", async () => {
        const invalidId = "12345";
        await api.put(`/api/jobs/${invalidId}`).send({}).expect(400);
      });
});
