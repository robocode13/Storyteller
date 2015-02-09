using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Storyteller.Core.Engine;
using Storyteller.Core.Grammars;
using Storyteller.Core.Model;
using Storyteller.Core.Model.Persistence;
using Storyteller.Core.Results;

namespace Storyteller.Core
{
    public class NulloObserver : IObserver
    {
        public void SpecExecutionFinished(ISpecContext context, SpecificationPlan plan)
        {
            // Nothing
        }

        public void Handle<T>(T message) where T : IResultMessage
        {
            // Nothing
        }

        public void SpecHandled(string id)
        {
            // Nothing
        }

        public Task MonitorBatch(IEnumerable<SpecNode> nodes)
        {
            throw new NotSupportedException();
        }

        public void SpecRequeued(SpecificationPlan plan, ISpecContext context)
        {
            // Nothing
        }

        public void SpecHandled(SpecificationPlan plan, ISpecContext context)
        {
        }

        Task<IEnumerable<SpecResult>> IObserver.MonitorBatch(IEnumerable<SpecNode> nodes)
        {
            throw new NotSupportedException();
        }
    }
}