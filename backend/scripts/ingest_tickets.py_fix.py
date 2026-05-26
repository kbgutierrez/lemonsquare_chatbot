    parser = argparse.ArgumentParser(
        description="Ingest resolved tickets into Qdrant as canonical knowledge clusters."
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=10,
        help="Number of documents to upload per batch.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    run_ingestion(batch_size=max(1, args.batch_size))
