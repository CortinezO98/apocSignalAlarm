using FluentValidation;

namespace Apoc.Application.UseCases;

public sealed class StartClaimValidator : AbstractValidator<StartClaimDto>
{
    public StartClaimValidator()
    {
        RuleFor(x => x.ClaimantDocNumber)
            .NotEmpty().MaximumLength(30);
        RuleFor(x => x.VictimDocNumber)
            .NotEmpty().MaximumLength(30);
        RuleFor(x => x.Line)
            .NotEmpty();
        RuleFor(x => x.ClaimType)
            .NotEmpty();
    }
}
