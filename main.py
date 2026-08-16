import fast_rlm
from fast_rlm import RLMConfig

# primary_agent is REQUIRED — there is no default model.
config = RLMConfig(primary_agent="google/gemma-4-31b-it:free", max_global_calls=10)

def main():
    result = fast_rlm.run("Generate 50 fruits and count number of r", config=config)
    print(result["results"])
    print(result["usage"])


if __name__ == "__main__":
    main()
